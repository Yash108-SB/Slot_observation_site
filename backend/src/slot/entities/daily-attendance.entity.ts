import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SlotMaster } from './slot-master.entity';

@Entity('daily_attendances')
export class DailyAttendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SlotMaster, (slotMaster) => slotMaster.dailyAttendances)
  @JoinColumn({ name: 'slotMasterId' })
  slotMaster: SlotMaster;

  @Column()
  slotMasterId: string;

  @Column({ type: 'date' })
  attendanceDate: Date;

  @Column({ type: 'int', default: 0 })
  presentCount: number;

  @Column({ type: 'int', default: 0 })
  absentCount: number; // Auto-calculated: capacity - presentCount

  @Column({ type: 'int', default: 0 })
  totalStudents: number; // Set to capacity from SlotMaster

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  attendancePercentage: number; // Auto-calculated: (presentCount / totalStudents) * 100

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'json', nullable: true })
  studentDetails: any; // Can store array of student names/IDs who were present/absent

  @CreateDateColumn()
  createdAt: Date;
}
