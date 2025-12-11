import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyAttendanceDto } from './create-daily-attendance.dto';

export class UpdateDailyAttendanceDto extends PartialType(CreateDailyAttendanceDto) {}
