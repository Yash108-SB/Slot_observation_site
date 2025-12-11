import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { SlotObservation } from '../slot/entities/slot-observation.entity';
import { SlotMaster } from '../slot/entities/slot-master.entity';
import { DailyAttendance } from '../slot/entities/daily-attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SlotObservation, SlotMaster, DailyAttendance])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
