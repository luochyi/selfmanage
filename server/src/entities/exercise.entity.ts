import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BodyPart } from './body-part.entity';
import { WorkoutDetail } from './workout-detail.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column()
  body_part_id: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => BodyPart, bodyPart => bodyPart.exercises)
  @JoinColumn({ name: 'body_part_id' })
  bodyPart: BodyPart;

  @OneToMany(() => WorkoutDetail, detail => detail.exercise)
  details: WorkoutDetail[];
}