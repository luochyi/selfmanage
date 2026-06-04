import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { WorkoutSession } from './workout-session.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  openid: string;

  @Column({ length: 50, nullable: true })
  nickname: string;

  @Column({ length: 500, nullable: true })
  avatar_url: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => WorkoutSession, workout => workout.user)
  workouts: WorkoutSession[];
}