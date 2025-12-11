import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, Min, Length, IsJSON } from 'class-validator';
import { Transform } from 'class-transformer';
import { sanitizeInput } from '../utils/sanitize.util';

export class CreateDailyAttendanceDto {
  @IsNotEmpty()
  @IsString()
  slotMasterId: string;

  @IsOptional()
  @IsDateString()
  attendanceDate?: string; // Defaults to today if not provided

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  presentCount: number; // Only this is required, rest is auto-calculated

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  @Transform(({ value }) => value ? sanitizeInput(value) : value)
  remarks?: string;

  @IsOptional()
  @IsJSON()
  studentDetails?: any; // Array of student info
}
