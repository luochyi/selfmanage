import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Exercise } from './exercise.entity';
import { WorkoutSession } from './workout-session.entity';

@Entity('body_parts')
export class BodyPart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  name: string;

  @Column({ length: 20, nullable: true })
  color: string;

  @OneToMany(() => Exercise, exercise => exercise.bodyPart)
  exercises: Exercise[];

  @OneToMany(() => WorkoutSession, workout => workout.bodyPart)
  workouts: WorkoutSession[];
}