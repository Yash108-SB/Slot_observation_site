import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFacultyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  department: string;
}
