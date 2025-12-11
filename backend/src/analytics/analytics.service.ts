import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SlotObservation } from '../slot/entities/slot-observation.entity';
import { SlotMaster } from '../slot/entities/slot-master.entity';
import { DailyAttendance } from '../slot/entities/daily-attendance.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(SlotObservation)
    private slotRepository: Repository<SlotObservation>,
    @InjectRepository(SlotMaster)
    private slotMasterRepository: Repository<SlotMaster>,
    @InjectRepository(DailyAttendance)
    private dailyAttendanceRepository: Repository<DailyAttendance>,
  ) {}

  // ===== NEW ATTENDANCE ANALYTICS =====
  async getAttendanceStatistics(startDate?: Date, endDate?: Date) {
    const whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.attendanceDate = Between(startDate, endDate);
    }

    const attendanceRecords = await this.dailyAttendanceRepository.find({
      where: whereClause,
      relations: ['slotMaster'],
    });

    const totalRecords = attendanceRecords.length;
    const totalPresent = attendanceRecords.reduce((sum, record) => sum + record.presentCount, 0);
    const totalAbsent = attendanceRecords.reduce((sum, record) => sum + record.absentCount, 0);
    const totalStudents = attendanceRecords.reduce((sum, record) => sum + record.totalStudents, 0);

    const averageAttendanceRate = totalStudents > 0 
      ? ((totalPresent / totalStudents) * 100).toFixed(2) 
      : 0;

    // Attendance by subject
    const subjectStats = attendanceRecords.reduce((acc, record) => {
      const subject = record.slotMaster?.subjectName || 'Unknown';
      if (!acc[subject]) {
        acc[subject] = { present: 0, absent: 0, total: 0 };
      }
      acc[subject].present += record.presentCount;
      acc[subject].absent += record.absentCount;
      acc[subject].total += record.totalStudents;
      return acc;
    }, {});

    const subjectDistribution = Object.entries(subjectStats).map(([subject, stats]: [string, any]) => ({
      subject,
      presentCount: stats.present,
      absentCount: stats.absent,
      totalStudents: stats.total,
      attendanceRate: stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : 0,
    }));

    // Attendance by faculty
    const facultyStats = attendanceRecords.reduce((acc, record) => {
      const faculty = record.slotMaster?.facultyName || 'Unknown';
      if (!acc[faculty]) {
        acc[faculty] = { present: 0, absent: 0, total: 0 };
      }
      acc[faculty].present += record.presentCount;
      acc[faculty].absent += record.absentCount;
      acc[faculty].total += record.totalStudents;
      return acc;
    }, {});

    const facultyDistribution = Object.entries(facultyStats).map(([faculty, stats]: [string, any]) => ({
      faculty,
      presentCount: stats.present,
      absentCount: stats.absent,
      totalStudents: stats.total,
      attendanceRate: stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : 0,
    }));

    // Daily trend
    const dailyStats = attendanceRecords.reduce((acc, record) => {
      const date = record.attendanceDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { present: 0, absent: 0, total: 0 };
      }
      acc[date].present += record.presentCount;
      acc[date].absent += record.absentCount;
      acc[date].total += record.totalStudents;
      return acc;
    }, {});

    const dailyTrend = Object.entries(dailyStats)
      .map(([date, stats]: [string, any]) => ({
        date,
        presentCount: stats.present,
        absentCount: stats.absent,
        totalStudents: stats.total,
        attendanceRate: stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(2) : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      summary: {
        totalRecords,
        totalPresent,
        totalAbsent,
        totalStudents,
        averageAttendanceRate: parseFloat(averageAttendanceRate as string),
      },
      subjectDistribution,
      facultyDistribution,
      dailyTrend,
    };
  }

  async getSlotAttendanceHistory(slotMasterId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const attendanceRecords = await this.dailyAttendanceRepository.find({
      where: {
        slotMasterId,
        attendanceDate: Between(startDate, endDate),
      },
      order: { attendanceDate: 'ASC' },
      relations: ['slotMaster'],
    });

    return attendanceRecords.map(record => ({
      date: record.attendanceDate,
      presentCount: record.presentCount,
      absentCount: record.absentCount,
      totalStudents: record.totalStudents,
      attendanceRate: record.totalStudents > 0 
        ? ((record.presentCount / record.totalStudents) * 100).toFixed(2) 
        : 0,
      remarks: record.remarks,
    }));
  }

  async getFilteredAttendanceAnalytics(filters: {
    subjectName?: string;
    facultyName?: string;
    startTime?: string;
    endTime?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    // Build query with relations
    let query = this.dailyAttendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.slotMaster', 'slotMaster');

    // Apply date filters
    if (filters.startDate && filters.endDate) {
      query = query.where('attendance.attendanceDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    // Apply slot master filters
    if (filters.subjectName) {
      query = query.andWhere('slotMaster.subjectName = :subjectName', {
        subjectName: filters.subjectName,
      });
    }

    if (filters.facultyName) {
      query = query.andWhere('slotMaster.facultyName = :facultyName', {
        facultyName: filters.facultyName,
      });
    }

    if (filters.startTime) {
      query = query.andWhere('slotMaster.startTime = :startTime', {
        startTime: filters.startTime,
      });
    }

    if (filters.endTime) {
      query = query.andWhere('slotMaster.endTime = :endTime', {
        endTime: filters.endTime,
      });
    }

    query = query.orderBy('attendance.attendanceDate', 'ASC');

    const attendanceRecords = await query.getMany();

    // Calculate statistics
    const totalRecords = attendanceRecords.length;
    const totalPresent = attendanceRecords.reduce((sum, record) => sum + record.presentCount, 0);
    const totalAbsent = attendanceRecords.reduce((sum, record) => sum + record.absentCount, 0);
    const totalStudents = attendanceRecords.reduce((sum, record) => sum + record.totalStudents, 0);

    const averageAttendanceRate = totalStudents > 0 
      ? ((totalPresent / totalStudents) * 100).toFixed(2) 
      : '0';

    // Daily breakdown
    const dailyRecords = attendanceRecords.map(record => ({
      date: record.attendanceDate,
      slotName: record.slotMaster?.slotName,
      subjectName: record.slotMaster?.subjectName,
      facultyName: record.slotMaster?.facultyName,
      startTime: record.slotMaster?.startTime,
      endTime: record.slotMaster?.endTime,
      presentCount: record.presentCount,
      absentCount: record.absentCount,
      totalStudents: record.totalStudents,
      attendanceRate: record.totalStudents > 0 
        ? ((record.presentCount / record.totalStudents) * 100).toFixed(2) 
        : '0',
      remarks: record.remarks,
    }));

    // Calculate trends
    const bestAttendance = attendanceRecords.reduce((max, record) => {
      const rate = record.totalStudents > 0 ? (record.presentCount / record.totalStudents) * 100 : 0;
      const maxRate = max.totalStudents > 0 ? (max.presentCount / max.totalStudents) * 100 : 0;
      return rate > maxRate ? record : max;
    }, attendanceRecords[0] || { presentCount: 0, totalStudents: 1, attendanceDate: null });

    const worstAttendance = attendanceRecords.reduce((min, record) => {
      const rate = record.totalStudents > 0 ? (record.presentCount / record.totalStudents) * 100 : 0;
      const minRate = min.totalStudents > 0 ? (min.presentCount / min.totalStudents) * 100 : 0;
      return rate < minRate ? record : min;
    }, attendanceRecords[0] || { presentCount: 0, totalStudents: 1, attendanceDate: null });

    return {
      filters: {
        subjectName: filters.subjectName || 'All',
        facultyName: filters.facultyName || 'All',
        timeSlot: filters.startTime && filters.endTime 
          ? `${filters.startTime} - ${filters.endTime}` 
          : 'All',
        dateRange: filters.startDate && filters.endDate
          ? `${filters.startDate.toISOString().split('T')[0]} to ${filters.endDate.toISOString().split('T')[0]}`
          : 'All time',
      },
      summary: {
        totalClasses: totalRecords,
        totalPresent,
        totalAbsent,
        totalStudents,
        averageAttendanceRate: parseFloat(averageAttendanceRate),
      },
      trends: {
        bestDay: bestAttendance.attendanceDate ? {
          date: bestAttendance.attendanceDate,
          attendanceRate: bestAttendance.totalStudents > 0 
            ? ((bestAttendance.presentCount / bestAttendance.totalStudents) * 100).toFixed(2)
            : '0',
          presentCount: bestAttendance.presentCount,
          totalStudents: bestAttendance.totalStudents,
        } : null,
        worstDay: worstAttendance.attendanceDate ? {
          date: worstAttendance.attendanceDate,
          attendanceRate: worstAttendance.totalStudents > 0 
            ? ((worstAttendance.presentCount / worstAttendance.totalStudents) * 100).toFixed(2)
            : '0',
          presentCount: worstAttendance.presentCount,
          totalStudents: worstAttendance.totalStudents,
        } : null,
      },
      dailyRecords,
    };
  }

  // ===== OLD SLOT OBSERVATION ANALYTICS (Keep for backward compatibility) =====
  async getStatistics() {
    const total = await this.slotRepository.count();
    
    const sumResult = await this.slotRepository
      .createQueryBuilder('slot')
      .select('SUM(slot.amount)', 'totalAmount')
      .getRawOne();
    
    const avgResult = await this.slotRepository
      .createQueryBuilder('slot')
      .select('AVG(slot.amount)', 'averageAmount')
      .getRawOne();

    const statusCounts = await this.slotRepository
      .createQueryBuilder('slot')
      .select('slot.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('slot.status')
      .getRawMany();

    const locationCounts = await this.slotRepository
      .createQueryBuilder('slot')
      .select('slot.location', 'location')
      .addSelect('COUNT(*)', 'count')
      .groupBy('slot.location')
      .getRawMany();

    return {
      total,
      totalAmount: parseFloat(sumResult?.totalAmount || 0),
      averageAmount: parseFloat(avgResult?.averageAmount || 0),
      statusDistribution: statusCounts.map(s => ({
        status: s.status,
        count: parseInt(s.count, 10),
      })),
      locationDistribution: locationCounts.map(l => ({
        location: l.location,
        count: parseInt(l.count, 10),
      })),
    };
  }

  async getRecentActivity(limit: number = 10) {
    return await this.slotRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async verifyAnalyticsSync() {
    try {
      // Count all entities
      const totalSlotMasters = await this.slotMasterRepository.count({ where: { isActive: true } });
      const totalAttendance = await this.dailyAttendanceRepository.count();
      
      // Get date range of attendance data
      const oldestAttendance = await this.dailyAttendanceRepository.findOne({
        order: { attendanceDate: 'ASC' },
      });
      
      const latestAttendance = await this.dailyAttendanceRepository.findOne({
        order: { attendanceDate: 'DESC' },
        relations: ['slotMaster'],
      });

      // Verify relationships
      const attendanceWithSlots = await this.dailyAttendanceRepository
        .createQueryBuilder('attendance')
        .innerJoinAndSelect('attendance.slotMaster', 'slotMaster')
        .getCount();

      const orphanedAttendance = totalAttendance - attendanceWithSlots;

      // Get analytics data counts
      const analyticsStats = await this.getAttendanceStatistics();

      return {
        syncStatus: orphanedAttendance === 0 ? 'synced' : 'warning',
        timestamp: new Date().toISOString(),
        database: {
          activeSlots: totalSlotMasters,
          totalAttendanceRecords: totalAttendance,
          linkedAttendanceRecords: attendanceWithSlots,
          orphanedRecords: orphanedAttendance,
          dateRange: {
            earliest: oldestAttendance?.attendanceDate || null,
            latest: latestAttendance?.attendanceDate || null,
          },
        },
        analytics: {
          totalRecordsProcessed: analyticsStats.summary.totalRecords,
          subjectsTracked: analyticsStats.subjectDistribution.length,
          facultiesTracked: analyticsStats.facultyDistribution.length,
          daysWithData: analyticsStats.dailyTrend.length,
        },
        latestRecord: latestAttendance ? {
          date: latestAttendance.attendanceDate,
          subject: latestAttendance.slotMaster?.subjectName,
          faculty: latestAttendance.slotMaster?.facultyName,
          presentCount: latestAttendance.presentCount,
          totalStudents: latestAttendance.totalStudents,
        } : null,
        integrity: {
          dataConsistency: totalAttendance === analyticsStats.summary.totalRecords,
          relationshipsIntact: orphanedAttendance === 0,
          analyticsUpToDate: true, // Always true since we query directly from DB
        },
        message: orphanedAttendance > 0
          ? `Warning: ${orphanedAttendance} attendance records have missing slot references`
          : 'All systems synced. Analytics reflect current database state.',
      };
    } catch (error) {
      return {
        syncStatus: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        message: 'Failed to verify analytics sync',
      };
    }
  }

  // ===== LOW ATTENDANCE ALERTS =====
  /**
   * Get low attendance alerts for subjects below threshold
   * 
   * Capacity Rules:
   * - Labs 638 & 515: Max capacity = 40 students
   * - All other labs: Max capacity = 20 students
   * - All lectures: Max capacity = 60 students
   * 
   * Threshold Rules:
   * - Labs: Alert if < 70% attendance
   * - Lectures: Alert if < 75% attendance
   * 
   * Consolidation: Groups by Subject + Faculty + ClassType + Batch/Division
   * (combines all time slots for the same combination)
   */
  async getLowAttendanceAlerts(filters?: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const whereClause: any = {};
    
    if (filters?.startDate && filters?.endDate) {
      whereClause.attendanceDate = Between(filters.startDate, filters.endDate);
    }

    // Fetch all attendance records with slot master data
    const attendanceRecords = await this.dailyAttendanceRepository.find({
      where: whereClause,
      relations: ['slotMaster'],
    });

    // Group by subject + faculty + classType + batch/division (NOT by time slot)
    const combinedStats = attendanceRecords.reduce((acc, record) => {
      const slotMaster = record.slotMaster;
      if (!slotMaster) return acc;

      const classType = slotMaster.classType || 'LECTURE';
      const key = `${slotMaster.subjectName}|${slotMaster.facultyName}|${classType}|${slotMaster.batchName || slotMaster.divisionName || 'N/A'}`;

      if (!acc[key]) {
        acc[key] = {
          subjectName: slotMaster.subjectName,
          facultyName: slotMaster.facultyName,
          classType: classType,
          batchName: slotMaster.batchName,
          divisionName: slotMaster.divisionName,
          capacity: slotMaster.capacity,
          records: [],
          slotMasterIds: new Set(),
        };
      }
      
      acc[key].records.push(record);
      acc[key].slotMasterIds.add(record.slotMasterId);
      return acc;
    }, {});

    // Calculate averages and identify low attendance
    const alerts = [];
    
    for (const [key, data] of Object.entries(combinedStats) as [string, any][]) {
      const { subjectName, facultyName, classType, batchName, divisionName, capacity, records, slotMasterIds } = data;

      const totalPresent = records.reduce((sum, r) => sum + r.presentCount, 0);
      const totalPossible = records.reduce((sum, r) => sum + r.totalStudents, 0);
      const averageAttendance = totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0;

      const threshold = classType === 'LAB' ? 70 : 75;

      if (averageAttendance < threshold) {
        alerts.push({
          subjectName: subjectName,
          facultyName: facultyName,
          classType: classType,
          batchName: batchName,
          divisionName: divisionName,
          capacity: capacity,
          averageAttendancePercentage: parseFloat(averageAttendance.toFixed(2)),
          threshold: threshold,
          totalClasses: records.length,
          totalPresent: totalPresent,
          totalPossible: totalPossible,
          totalTimeSlots: slotMasterIds.size,
          alertSeverity: averageAttendance < (threshold - 10) ? 'critical' : 'warning',
          records: records.map(r => ({
            date: r.attendanceDate,
            presentCount: r.presentCount,
            absentCount: r.absentCount,
            totalStudents: r.totalStudents,
            attendancePercentage: r.attendancePercentage,
            remarks: r.remarks,
            slotDetails: r.slotMaster ? {
              startTime: r.slotMaster.startTime,
              endTime: r.slotMaster.endTime,
              dayOfWeek: r.slotMaster.dayOfWeek,
            } : null,
          })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        });
      }
    }

    // Sort by severity and attendance percentage
    alerts.sort((a, b) => {
      if (a.alertSeverity !== b.alertSeverity) {
        return a.alertSeverity === 'critical' ? -1 : 1;
      }
      return a.averageAttendancePercentage - b.averageAttendancePercentage;
    });

    return {
      summary: {
        totalAlertsCount: alerts.length,
        criticalCount: alerts.filter(a => a.alertSeverity === 'critical').length,
        warningCount: alerts.filter(a => a.alertSeverity === 'warning').length,
        labAlertsCount: alerts.filter(a => a.classType === 'LAB').length,
        lectureAlertsCount: alerts.filter(a => a.classType === 'LECTURE').length,
        dateRange: filters?.startDate && filters?.endDate ? {
          from: filters.startDate.toISOString().split('T')[0],
          to: filters.endDate.toISOString().split('T')[0],
        } : null,
      },
      alerts,
    };
  }
}

