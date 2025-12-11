import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { SlotMaster } from '../slot/entities/slot-master.entity';
import { DailyAttendance } from '../slot/entities/daily-attendance.entity';
import { SlotObservation } from '../slot/entities/slot-observation.entity';

@Injectable()
export class DatabaseService {
  constructor(@InjectConnection() private connection: Connection) {}

  async getStatus() {
    try {
      const isConnected = this.connection.isInitialized;
      const driver = this.connection.driver;
      
      return {
        connected: isConnected,
        type: driver.options.type,
        database: driver.database,
        host: (driver.options as any).host,
        port: (driver.options as any).port,
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }

  async getTables() {
    try {
      const tables = await this.connection.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      return tables.map(t => t.table_name);
    } catch (error) {
      throw new Error(`Failed to fetch tables: ${error.message}`);
    }
  }

  async getTableInfo(tableName: string) {
    try {
      const columns = await this.connection.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      const rowCount = await this.connection.query(`
        SELECT COUNT(*) as count FROM ${tableName}
      `);

      return {
        tableName,
        columns,
        rowCount: parseInt(rowCount[0].count, 10),
      };
    } catch (error) {
      throw new Error(`Failed to fetch table info: ${error.message}`);
    }
  }

  async getSlotMastersCount() {
    try {
      const count = await this.connection
        .getRepository(SlotMaster)
        .count({ where: { isActive: true } });
      return { table: 'slot_masters', count };
    } catch (error) {
      throw new Error(`Failed to count slot masters: ${error.message}`);
    }
  }

  async getDailyAttendanceCount(date?: Date) {
    try {
      const whereClause: any = {};
      if (date) {
        whereClause.attendanceDate = date;
      }
      
      const count = await this.connection
        .getRepository(DailyAttendance)
        .count({ where: whereClause });
      
      return { 
        table: 'daily_attendances', 
        count,
        date: date ? date.toISOString().split('T')[0] : 'all'
      };
    } catch (error) {
      throw new Error(`Failed to count daily attendance: ${error.message}`);
    }
  }

  async verifyDataSync() {
    try {
      // Get counts from all tables
      const slotMasters = await this.connection
        .getRepository(SlotMaster)
        .count({ where: { isActive: true } });
      
      const allAttendance = await this.connection
        .getRepository(DailyAttendance)
        .count();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAttendance = await this.connection
        .getRepository(DailyAttendance)
        .count({ where: { attendanceDate: today } });
      
      // Get latest attendance record
      const latestAttendance = await this.connection
        .getRepository(DailyAttendance)
        .findOne({
          order: { createdAt: 'DESC' },
          relations: ['slotMaster'],
        });

      // Get unique subjects and faculties
      const subjects = await this.connection
        .getRepository(SlotMaster)
        .createQueryBuilder('slot')
        .select('DISTINCT slot.subjectName', 'subject')
        .where('slot.isActive = :active', { active: true })
        .getRawMany();

      const faculties = await this.connection
        .getRepository(SlotMaster)
        .createQueryBuilder('slot')
        .select('DISTINCT slot.facultyName', 'faculty')
        .where('slot.isActive = :active', { active: true })
        .getRawMany();

      return {
        syncStatus: 'healthy',
        timestamp: new Date().toISOString(),
        tables: {
          slot_masters: {
            active: slotMasters,
            uniqueSubjects: subjects.length,
            uniqueFaculties: faculties.length,
          },
          daily_attendances: {
            total: allAttendance,
            today: todayAttendance,
            latestRecord: latestAttendance ? {
              date: latestAttendance.attendanceDate,
              subject: latestAttendance.slotMaster?.subjectName,
              faculty: latestAttendance.slotMaster?.facultyName,
              present: latestAttendance.presentCount,
              absent: latestAttendance.absentCount,
            } : null,
          },
        },
        analyticsReady: slotMasters > 0 && allAttendance > 0,
        message: allAttendance === 0 
          ? 'No attendance records yet. Start marking attendance to see analytics.'
          : `Analytics ready with ${allAttendance} attendance records across ${slotMasters} active slots.`
      };
    } catch (error) {
      return {
        syncStatus: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        analyticsReady: false,
      };
    }
  }

  async getRecentChanges(limit: number = 10) {
    try {
      // Get recent attendance records
      const recentAttendance = await this.connection
        .getRepository(DailyAttendance)
        .find({
          order: { createdAt: 'DESC' },
          take: limit,
          relations: ['slotMaster'],
        });

      // Get recently updated slot masters
      const recentSlots = await this.connection
        .getRepository(SlotMaster)
        .find({
          where: { isActive: true },
          order: { updatedAt: 'DESC' },
          take: limit,
        });

      return {
        recentAttendance: recentAttendance.map(a => ({
          id: a.id,
          date: a.attendanceDate,
          subject: a.slotMaster?.subjectName,
          faculty: a.slotMaster?.facultyName,
          present: a.presentCount,
          absent: a.absentCount,
          createdAt: a.createdAt,
        })),
        recentSlots: recentSlots.map(s => ({
          id: s.id,
          slotName: s.slotName,
          subject: s.subjectName,
          faculty: s.facultyName,
          dayOfWeek: s.dayOfWeek,
          time: `${s.startTime} - ${s.endTime}`,
          updatedAt: s.updatedAt,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to fetch recent changes: ${error.message}`);
    }
  }
}
