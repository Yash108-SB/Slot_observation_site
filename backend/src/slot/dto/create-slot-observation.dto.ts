import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSlotObservationDto {
  @IsNotEmpty()
  @IsString()
  slotName: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
