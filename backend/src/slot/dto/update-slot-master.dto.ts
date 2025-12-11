import { PartialType } from '@nestjs/mapped-types';
import { CreateSlotMasterDto } from './create-slot-master.dto';

export class UpdateSlotMasterDto extends PartialType(CreateSlotMasterDto) {}
