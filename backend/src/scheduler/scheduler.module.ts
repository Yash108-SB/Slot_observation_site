import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { SlotModule } from '../slot/slot.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SlotModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
