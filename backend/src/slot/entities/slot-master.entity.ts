import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('slot_masters')
export class SlotMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  slotName: string;

  @Column()
  subjectName: string;

  @Column()
  facultyName: string;

  @Column({ 
    type: 'enum', 
    enum: ['LAB', 'LECTURE'],
    default: 'LECTURE'
  })
  classType: 'LAB' | 'LECTURE';

  @Column({ type: 'int' })
  capacity: number; // 20 for labs, 60 for lectures

  @Column({ length: 100, nullable: true })
  batchName: string; // For labs (e.g., "Batch A", "Batch B")

  @Column({ length: 100, nullable: true })
  divisionName: string; // For lectures (e.g., "Division 1", "Division 2")

  @Column()
  startTime: string; // Format: "HH:mm"

  @Column()
  endTime: string; // Format: "HH:mm"

  @Column()
  dayOfWeek: string; // Monday, Tuesday, etc.

  @Column({ default: true })
  isActive: boolean;

  @OneToMany('DailyAttendance', 'slotMaster')
  dailyAttendances: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
