import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { BodyPart } from './body-part.entity';
import { WorkoutDetail } from './workout-detail.entity';

@Entity('workout_sessions')
export class WorkoutSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'date' })
  workout_date: Date;

  @Column()
  body_part_id: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, user => user.workouts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => BodyPart, bodyPart => bodyPart.workouts)
  @JoinColumn({ name: 'body_part_id' })
  bodyPart: BodyPart;

  @OneToMany(() => WorkoutDetail, detail => detail.session)
  details: WorkoutDetail[];
}