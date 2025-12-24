import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('allocations')
export class Allocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    type: 'enum', 
    enum: ['LAB', 'LECTURE'],
  })
  type: 'LAB' | 'LECTURE';

  @Column()
  subjectName: string;

  @Column()
  facultyName: string;

  @Column()
  semester: string;

  @Column()
  division: string;

  // Lab-specific fields
  @Column({ nullable: true })
  batchName?: string;

  @Column('simple-array', { nullable: true })
  labNumbers?: string[];

  // Lecture-specific fields
  @Column('simple-array', { nullable: true })
  classRoomNumbers?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
