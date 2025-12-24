import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SlotService } from './slot.service';
import { CreateSlotObservationDto } from './dto/create-slot-observation.dto';
import { UpdateSlotObservationDto } from './dto/update-slot-observation.dto';
import { CreateSlotMasterDto } from './dto/create-slot-master.dto';
import { UpdateSlotMasterDto } from './dto/update-slot-master.dto';
import { CreateDailyAttendanceDto } from './dto/create-daily-attendance.dto';
import { UpdateDailyAttendanceDto } from './dto/update-daily-attendance.dto';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';

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

  // ===== FACULTY ENDPOINTS =====
  @Post('faculties')
  createFaculty(@Body() createDto: CreateFacultyDto) {
    return this.slotService.createFaculty(createDto);
  }

  @Get('faculties')
  findAllFaculties() {
    return this.slotService.findAllFaculties();
  }

  @Get('faculties/:id')
  findOneFaculty(@Param('id') id: string) {
    return this.slotService.findOneFaculty(id);
  }

  @Patch('faculties/:id')
  updateFaculty(@Param('id') id: string, @Body() updateDto: UpdateFacultyDto) {
    return this.slotService.updateFaculty(id, updateDto);
  }

  @Delete('faculties/:id')
  removeFaculty(@Param('id') id: string) {
    return this.slotService.removeFaculty(id);
  }

  // ===== SUBJECT ENDPOINTS =====
  @Post('subjects')
  createSubject(@Body() createDto: CreateSubjectDto) {
    return this.slotService.createSubject(createDto);
  }

  @Get('subjects')
  findAllSubjects() {
    return this.slotService.findAllSubjects();
  }

  @Get('subjects/:id')
  findOneSubject(@Param('id') id: string) {
    return this.slotService.findOneSubject(id);
  }

  @Patch('subjects/:id')
  updateSubject(@Param('id') id: string, @Body() updateDto: UpdateSubjectDto) {
    return this.slotService.updateSubject(id, updateDto);
  }

  @Delete('subjects/:id')
  removeSubject(@Param('id') id: string) {
    return this.slotService.removeSubject(id);
  }

  // ===== ALLOCATION ENDPOINTS =====
  @Post('allocations')
  createAllocation(@Body() createDto: CreateAllocationDto) {
    return this.slotService.createAllocation(createDto);
  }

  @Get('allocations')
  findAllAllocations() {
    return this.slotService.findAllAllocations();
  }

  @Get('allocations/:id')
  findOneAllocation(@Param('id') id: string) {
    return this.slotService.findOneAllocation(id);
  }

  @Patch('allocations/:id')
  updateAllocation(@Param('id') id: string, @Body() updateDto: UpdateAllocationDto) {
    return this.slotService.updateAllocation(id, updateDto);
  }

  @Delete('allocations/:id')
  removeAllocation(@Param('id') id: string) {
    return this.slotService.removeAllocation(id);
  }

  // ===== OLD ENDPOINTS (Backward compatibility) =====
  @Post()
  async create(@Body() createDto: CreateSlotObservationDto) {
    try {
      console.log('Creating slot observation:', createDto);
      return await this.slotService.create(createDto);
    } catch (error) {
      console.error('Error creating slot observation:', error);
      throw error;
    }
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
  async update(@Param('id') id: string, @Body() updateDto: UpdateSlotObservationDto) {
    try {
      console.log('Updating slot observation:', id, updateDto);
      return await this.slotService.update(id, updateDto);
    } catch (error) {
      console.error('Error updating slot observation:', error);
      throw error;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.slotService.remove(id);
  }
}
