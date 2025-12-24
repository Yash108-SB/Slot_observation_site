import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';

export class CreateAllocationDto {
  @IsEnum(['LAB', 'LECTURE'])
  @IsNotEmpty()
  type: 'LAB' | 'LECTURE';

  @IsString()
  @IsNotEmpty()
  subjectName: string;

  @IsString()
  @IsNotEmpty()
  facultyName: string;

  @IsString()
  @IsNotEmpty()
  semester: string;

  @IsString()
  @IsNotEmpty()
  division: string;

  @IsString()
  @IsOptional()
  batchName?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labNumbers?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  classRoomNumbers?: string[];
}
