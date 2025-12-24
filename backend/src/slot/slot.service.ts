import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SlotObservation } from './entities/slot-observation.entity';
import { SlotMaster } from './entities/slot-master.entity';
import { DailyAttendance } from './entities/daily-attendance.entity';
import { Faculty } from './entities/faculty.entity';
import { Subject } from './entities/subject.entity';
import { Allocation } from './entities/allocation.entity';
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

@Injectable()
export class SlotService {
  constructor(
    @InjectRepository(SlotObservation)
    private slotRepository: Repository<SlotObservation>,
    @InjectRepository(SlotMaster)
    private slotMasterRepository: Repository<SlotMaster>,
    @InjectRepository(DailyAttendance)
    private dailyAttendanceRepository: Repository<DailyAttendance>,
    @InjectRepository(Faculty)
    private facultyRepository: Repository<Faculty>,
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    @InjectRepository(Allocation)
    private allocationRepository: Repository<Allocation>,
  ) {}

  // Helper function to determine lab capacity based on room/lab number
  private determineLabCapacity(slotName: string, batchName: string | null): number {
    // Check if slot name or batch name contains 638 or 515
    const identifier = `${slotName} ${batchName || ''}`.toLowerCase();
    
    if (identifier.includes('638') || identifier.includes('515')) {
      return 40; // Special labs get 40 capacity
    }
    
    return 20; // All other labs get 20 capacity
  }

  // ===== SLOT MASTER METHODS =====
  async createSlotMaster(createDto: CreateSlotMasterDto): Promise<SlotMaster> {
    // Auto-set capacity based on classType and lab number
    let capacity = createDto.capacity;
    
    if (!capacity) {
      if (createDto.classType === 'LAB') {
        capacity = this.determineLabCapacity(createDto.slotName, createDto.batchName);
      } else {
        capacity = 60; // Lectures default to 60
      }
    } else if (createDto.classType === 'LAB' && capacity) {
      // Validate lab capacity against expected values
      const expectedCapacity = this.determineLabCapacity(createDto.slotName, createDto.batchName);
      if (capacity !== expectedCapacity) {
        console.warn(`Lab capacity mismatch: Expected ${expectedCapacity} for ${createDto.slotName}, got ${capacity}`);
      }
    }

    const slotMaster = this.slotMasterRepository.create({
      ...createDto,
      capacity,
    });
    return await this.slotMasterRepository.save(slotMaster);
  }

  async findAllSlotMasters(): Promise<SlotMaster[]> {
    return await this.slotMasterRepository.find({
      where: { isActive: true },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async findOneSlotMaster(id: string): Promise<SlotMaster> {
    return await this.slotMasterRepository.findOne({ where: { id } });
  }

  async updateSlotMaster(id: string, updateDto: UpdateSlotMasterDto): Promise<SlotMaster> {
    await this.slotMasterRepository.update(id, updateDto);
    return await this.findOneSlotMaster(id);
  }

  async removeSlotMaster(id: string): Promise<void> {
    // Soft delete by setting isActive to false
    await this.slotMasterRepository.update(id, { isActive: false });
  }

  // ===== DAILY ATTENDANCE METHODS =====
  async createDailyAttendance(createDto: CreateDailyAttendanceDto): Promise<DailyAttendance> {
    const attendanceDate = createDto.attendanceDate 
      ? new Date(createDto.attendanceDate) 
      : new Date();
    
    // Set time to start of day
    attendanceDate.setHours(0, 0, 0, 0);

    // Fetch slot master to get capacity and classType
    const slotMaster = await this.slotMasterRepository.findOne({ 
      where: { id: createDto.slotMasterId } 
    });

    if (!slotMaster) {
      throw new Error(`SlotMaster with id ${createDto.slotMasterId} not found`);
    }

    // Validate presentCount doesn't exceed capacity
    if (createDto.presentCount > slotMaster.capacity) {
      const labInfo = slotMaster.batchName ? ` (${slotMaster.batchName})` : '';
      const divisionInfo = slotMaster.divisionName ? ` (${slotMaster.divisionName})` : '';
      throw new Error(
        `Cannot enter attendance >= maximum capacity. Present count (${createDto.presentCount}) exceeds capacity (${slotMaster.capacity}) for ${slotMaster.classType}${labInfo}${divisionInfo}. Please enter attendance <= ${slotMaster.capacity}.`
      );
    }

    // Auto-calculate values based on capacity
    const totalStudents = slotMaster.capacity;
    const absentCount = totalStudents - createDto.presentCount;
    const attendancePercentage = (createDto.presentCount / totalStudents) * 100;

    // Check if attendance already exists for this slot and date
    const existing = await this.dailyAttendanceRepository.findOne({
      where: {
        slotMasterId: createDto.slotMasterId,
        attendanceDate: attendanceDate,
      },
    });

    if (existing) {
      // Update existing record with auto-calculated values
      await this.dailyAttendanceRepository.update(existing.id, {
        presentCount: createDto.presentCount,
        absentCount: absentCount,
        totalStudents: totalStudents,
        attendancePercentage: attendancePercentage,
        remarks: createDto.remarks,
        studentDetails: createDto.studentDetails,
      });
      return await this.dailyAttendanceRepository.findOne({ 
        where: { id: existing.id },
        relations: ['slotMaster'],
      });
    }

    // Create new record with auto-calculated values
    const attendance = this.dailyAttendanceRepository.create({
      slotMasterId: createDto.slotMasterId,
      attendanceDate,
      presentCount: createDto.presentCount,
      absentCount: absentCount,
      totalStudents: totalStudents,
      attendancePercentage: attendancePercentage,
      remarks: createDto.remarks,
      studentDetails: createDto.studentDetails,
    });
    
    return await this.dailyAttendanceRepository.save(attendance);
  }

  async getTodayAttendance(): Promise<DailyAttendance[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await this.dailyAttendanceRepository.find({
      where: { attendanceDate: today },
      relations: ['slotMaster'],
      order: { createdAt: 'ASC' },
    });
  }

  async getAttendanceByDate(date: Date): Promise<DailyAttendance[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    return await this.dailyAttendanceRepository.find({
      where: { attendanceDate: startDate },
      relations: ['slotMaster'],
      order: { createdAt: 'ASC' },
    });
  }

  async getAttendanceHistory(slotMasterId: string, startDate?: Date, endDate?: Date): Promise<DailyAttendance[]> {
    const query: any = { slotMasterId };
    
    if (startDate && endDate) {
      query.attendanceDate = Between(startDate, endDate);
    }

    return await this.dailyAttendanceRepository.find({
      where: query,
      relations: ['slotMaster'],
      order: { attendanceDate: 'DESC' },
    });
  }

  async updateDailyAttendance(id: string, updateDto: UpdateDailyAttendanceDto): Promise<DailyAttendance> {
    // Fetch the attendance record and its slot master
    const attendance = await this.dailyAttendanceRepository.findOne({ 
      where: { id },
      relations: ['slotMaster'],
    });

    if (!attendance) {
      throw new Error(`Attendance record with id ${id} not found`);
    }

    const slotMaster = attendance.slotMaster;

    // If presentCount is being updated, recalculate dependent values
    if (updateDto.presentCount !== undefined) {
      if (updateDto.presentCount > slotMaster.capacity) {
        const labInfo = slotMaster.batchName ? ` (${slotMaster.batchName})` : '';
        const divisionInfo = slotMaster.divisionName ? ` (${slotMaster.divisionName})` : '';
        throw new Error(
          `Cannot enter attendance >= maximum capacity. Present count (${updateDto.presentCount}) exceeds capacity (${slotMaster.capacity}) for ${slotMaster.classType}${labInfo}${divisionInfo}. Please enter attendance <= ${slotMaster.capacity}.`
        );
      }

      const totalStudents = slotMaster.capacity;
      const absentCount = totalStudents - updateDto.presentCount;
      const attendancePercentage = (updateDto.presentCount / totalStudents) * 100;

      await this.dailyAttendanceRepository.update(id, {
        presentCount: updateDto.presentCount,
        absentCount: absentCount,
        totalStudents: totalStudents,
        attendancePercentage: attendancePercentage,
        remarks: updateDto.remarks,
        studentDetails: updateDto.studentDetails,
      });
    } else {
      // Only update remarks or studentDetails
      await this.dailyAttendanceRepository.update(id, {
        remarks: updateDto.remarks,
        studentDetails: updateDto.studentDetails,
      });
    }

    return await this.dailyAttendanceRepository.findOne({ 
      where: { id },
      relations: ['slotMaster'],
    });
  }

  // ===== OLD SLOT OBSERVATION METHODS (Keep for backward compatibility) =====
  async create(createDto: CreateSlotObservationDto): Promise<SlotObservation> {
    const observation = this.slotRepository.create(createDto);
    return await this.slotRepository.save(observation);
  }

  async findAll(): Promise<SlotObservation[]> {
    return await this.slotRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SlotObservation> {
    return await this.slotRepository.findOne({ where: { id } });
  }

  async update(id: string, updateDto: UpdateSlotObservationDto): Promise<SlotObservation> {
    await this.slotRepository.update(id, updateDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.slotRepository.delete(id);
  }

  // ===== FACULTY METHODS =====
  async createFaculty(createDto: CreateFacultyDto): Promise<Faculty> {
    const faculty = this.facultyRepository.create(createDto);
    return await this.facultyRepository.save(faculty);
  }

  async findAllFaculties(): Promise<Faculty[]> {
    return await this.facultyRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOneFaculty(id: string): Promise<Faculty> {
    return await this.facultyRepository.findOne({ where: { id } });
  }

  async updateFaculty(id: string, updateDto: UpdateFacultyDto): Promise<Faculty> {
    await this.facultyRepository.update(id, updateDto);
    return await this.findOneFaculty(id);
  }

  async removeFaculty(id: string): Promise<void> {
    await this.facultyRepository.delete(id);
  }

  // ===== SUBJECT METHODS =====
  async createSubject(createDto: CreateSubjectDto): Promise<Subject> {
    const subject = this.subjectRepository.create(createDto);
    return await this.subjectRepository.save(subject);
  }

  async findAllSubjects(): Promise<Subject[]> {
    return await this.subjectRepository.find({
      order: { year: 'ASC', name: 'ASC' },
    });
  }

  async findOneSubject(id: string): Promise<Subject> {
    return await this.subjectRepository.findOne({ where: { id } });
  }

  async updateSubject(id: string, updateDto: UpdateSubjectDto): Promise<Subject> {
    await this.subjectRepository.update(id, updateDto);
    return await this.findOneSubject(id);
  }

  async removeSubject(id: string): Promise<void> {
    await this.subjectRepository.delete(id);
  }

  // ===== ALLOCATION METHODS =====
  async createAllocation(createDto: CreateAllocationDto): Promise<Allocation> {
    const allocation = this.allocationRepository.create(createDto);
    return await this.allocationRepository.save(allocation);
  }

  async findAllAllocations(): Promise<Allocation[]> {
    return await this.allocationRepository.find({
      order: { semester: 'ASC', subjectName: 'ASC' },
    });
  }

  async findOneAllocation(id: string): Promise<Allocation> {
    return await this.allocationRepository.findOne({ where: { id } });
  }

  async updateAllocation(id: string, updateDto: UpdateAllocationDto): Promise<Allocation> {
    await this.allocationRepository.update(id, updateDto);
    return await this.findOneAllocation(id);
  }

  async removeAllocation(id: string): Promise<void> {
    await this.allocationRepository.delete(id);
  }
}
