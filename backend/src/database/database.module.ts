import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { SlotMaster } from '../slot/entities/slot-master.entity';
import { DailyAttendance } from '../slot/entities/daily-attendance.entity';
import { SlotObservation } from '../slot/entities/slot-observation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SlotMaster, DailyAttendance, SlotObservation])],
  controllers: [DatabaseController],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
