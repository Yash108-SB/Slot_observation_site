import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { SlotModule } from '../slot/slot.module';

@Module({
  imports: [ScheduleModule.forRoot(), SlotModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
