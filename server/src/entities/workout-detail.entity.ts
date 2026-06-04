import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { WorkoutSession } from './workout-session.entity';
import { Exercise } from './exercise.entity';

@Entity('workout_details')
export class WorkoutDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  session_id: number;

  @Column()
  exercise_id: number;

  @Column({ type: 'decimal', precision: 6, scale: 1, nullable: true })
  weight: number;

  @Column({ nullable: true })
  sets_count: number;

  @Column({ nullable: true })
  reps: number;

  @Column({ default: 0 })
  sort_order: number;

  @ManyToOne(() => WorkoutSession, session => session.details)
  @JoinColumn({ name: 'session_id' })
  session: WorkoutSession;

  @ManyToOne(() => Exercise, exercise => exercise.details)
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;
}