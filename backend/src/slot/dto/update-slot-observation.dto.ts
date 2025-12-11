import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateSlotObservationDto {
  @IsOptional()
  @IsString()
  slotName?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
