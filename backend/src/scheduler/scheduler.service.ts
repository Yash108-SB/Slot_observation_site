import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyAttendance } from '../slot/entities/daily-attendance.entity';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(DailyAttendance)
    private dailyAttendanceRepository: Repository<DailyAttendance>,
  ) {}

  // This runs every day at midnight (00:00:00)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleMidnightReset() {
    this.logger.log('Starting daily attendance reset at midnight...');
    
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      // Get yesterday's attendance records
      const yesterdayRecords = await this.dailyAttendanceRepository.find({
        where: { attendanceDate: yesterday },
      });

      this.logger.log(`Found ${yesterdayRecords.length} attendance records from yesterday that have been saved.`);
      
      // Note: We don't need to reset anything because each day creates new records
      // The old records are automatically preserved in the database
      // The system will create new records when attendance is marked today
      
      this.logger.log('Daily attendance reset completed successfully. Historical data preserved.');
      
    } catch (error) {
      this.logger.error('Error during midnight reset:', error);
    }
  }

  // Optional: Clean up very old records (e.g., older than 2 years) to save space
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanupOldRecords() {
    this.logger.log('Starting cleanup of old attendance records...');
    
    try {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      
      const result = await this.dailyAttendanceRepository
        .createQueryBuilder()
        .delete()
        .where('attendanceDate < :date', { date: twoYearsAgo })
        .execute();

      this.logger.log(`Deleted ${result.affected} attendance records older than 2 years.`);
      
    } catch (error) {
      this.logger.error('Error during old records cleanup:', error);
    }
  }
}
