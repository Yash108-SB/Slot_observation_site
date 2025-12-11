import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEnum, IsNumber, Length, Matches, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { sanitizeInput } from '../utils/sanitize.util';

export class CreateSlotMasterDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 200)
  @Transform(({ value }) => sanitizeInput(value))
  slotName: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @Transform(({ value }) => sanitizeInput(value))
  subjectName: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @Transform(({ value }) => sanitizeInput(value))
  facultyName: string;

  @IsNotEmpty()
  @IsEnum(['LAB', 'LECTURE'])
  classType: 'LAB' | 'LECTURE';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  capacity?: number; // Optional: Auto-set to 20 for labs (40 for 638/515), 60 for lectures

  @IsOptional()
  @IsString()
  @Length(0, 100)
  @Transform(({ value }) => value ? sanitizeInput(value) : value)
  batchName?: string; // For labs (e.g., "Batch A", "Batch B")

  @IsOptional()
  @IsString()
  @Length(0, 100)
  @Transform(({ value }) => value ? sanitizeInput(value) : value)
  divisionName?: string; // For lectures (e.g., "Division 1", "Division 2")

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime: string; // Format: "HH:mm"

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime: string; // Format: "HH:mm"

  @IsNotEmpty()
  @IsString()
  @Matches(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/, {
    message: 'dayOfWeek must be a valid day name',
  })
  dayOfWeek: string; // Monday, Tuesday, etc.

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
