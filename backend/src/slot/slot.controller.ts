import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SlotService } from './slot.service';
import { CreateSlotObservationDto } from './dto/create-slot-observation.dto';
import { UpdateSlotObservationDto } from './dto/update-slot-observation.dto';
import { CreateSlotMasterDto } from './dto/create-slot-master.dto';
import { UpdateSlotMasterDto } from './dto/update-slot-master.dto';
import { CreateDailyAttendanceDto } from './dto/create-daily-attendance.dto';
import { UpdateDailyAttendanceDto } from './dto/update-daily-attendance.dto';

@Controller('slots')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  // ===== SLOT MASTER ENDPOINTS =====
  @Post('masters')
  createSlotMaster(@Body() createDto: CreateSlotMasterDto) {
    return this.slotService.createSlotMaster(createDto);
  }

  @Get('masters')
  findAllSlotMasters() {
    return this.slotService.findAllSlotMasters();
  }

  @Get('masters/:id')
  findOneSlotMaster(@Param('id') id: string) {
    return this.slotService.findOneSlotMaster(id);
  }

  @Patch('masters/:id')
  updateSlotMaster(@Param('id') id: string, @Body() updateDto: UpdateSlotMasterDto) {
    return this.slotService.updateSlotMaster(id, updateDto);
  }

  @Delete('masters/:id')
  removeSlotMaster(@Param('id') id: string) {
    return this.slotService.removeSlotMaster(id);
  }

  // ===== DAILY ATTENDANCE ENDPOINTS =====
  @Post('attendance')
  createDailyAttendance(@Body() createDto: CreateDailyAttendanceDto) {
    return this.slotService.createDailyAttendance(createDto);
  }

  @Get('attendance/today')
  getTodayAttendance() {
    return this.slotService.getTodayAttendance();
  }

  @Get('attendance/date')
  getAttendanceByDate(@Query('date') date: string) {
    return this.slotService.getAttendanceByDate(new Date(date));
  }

  @Get('attendance/history/:slotMasterId')
  getAttendanceHistory(
    @Param('slotMasterId') slotMasterId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.slotService.getAttendanceHistory(slotMasterId, start, end);
  }

  @Patch('attendance/:id')
  updateDailyAttendance(@Param('id') id: string, @Body() updateDto: UpdateDailyAttendanceDto) {
    return this.slotService.updateDailyAttendance(id, updateDto);
  }

  // ===== OLD ENDPOINTS (Backward compatibility) =====
  @Post()
  create(@Body() createDto: CreateSlotObservationDto) {
    return this.slotService.create(createDto);
  }

  @Get()
  findAll() {
    return this.slotService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.slotService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSlotObservationDto) {
    return this.slotService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.slotService.remove(id);
  }
}
