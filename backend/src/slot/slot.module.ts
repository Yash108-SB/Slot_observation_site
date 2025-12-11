import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlotService } from './slot.service';
import { SlotController } from './slot.controller';
import { SlotObservation } from './entities/slot-observation.entity';
import { SlotMaster } from './entities/slot-master.entity';
import { DailyAttendance } from './entities/daily-attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SlotObservation, SlotMaster, DailyAttendance])],
  controllers: [SlotController],
  providers: [SlotService],
  exports: [SlotService, TypeOrmModule],
})
export class SlotModule {}
