import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { WorkoutSession } from '../../entities/workout-session.entity';
import { WorkoutDetail } from '../../entities/workout-detail.entity';
import { CreateWorkoutDto, UpdateWorkoutDto } from './dto/workout.dto';

@Injectable()
export class WorkoutService {
  constructor(
    @InjectRepository(WorkoutSession)
    private readonly sessionRepository: Repository<WorkoutSession>,
    @InjectRepository(WorkoutDetail)
    private readonly detailRepository: Repository<WorkoutDetail>,
  ) {}

  async getMonthlyWorkouts(userId: number, month: string) {
    // month 格式: 2026-06
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);

    const workouts = await this.sessionRepository.find({
      where: {
        user_id: userId,
        workout_date: Between(startDate, endDate),
      },
      relations: ['bodyPart'],
      order: { workout_date: 'ASC' },
    });

    return workouts;
  }

  async getWorkoutDetail(userId: number, workoutId: number) {
    const workout = await this.sessionRepository.findOne({
      where: { id: workoutId, user_id: userId },
      relations: ['bodyPart', 'details', 'details.exercise'],
    });

    if (!workout) {
      throw new NotFoundException('训练记录不存在');
    }

    return workout;
  }

  async createWorkout(userId: number, createWorkoutDto: CreateWorkoutDto) {
    const { workout_date, body_part_id, note, details } = createWorkoutDto;

    // 创建训练会话
    const session = this.sessionRepository.create({
      user_id: userId,
      workout_date: new Date(workout_date),
      body_part_id,
      note,
    });

    const savedSession = await this.sessionRepository.save(session);

    // 创建训练明细
    if (details && details.length > 0) {
      const workoutDetails = details.map((detail, index) =>
        this.detailRepository.create({
          session_id: savedSession.id,
          exercise_id: detail.exercise_id,
          weight: detail.weight,
          sets_count: detail.sets_count,
          reps: detail.reps,
          sort_order: detail.sort_order || index,
        }),
      );

      await this.detailRepository.save(workoutDetails);
    }

    return await this.getWorkoutDetail(userId, savedSession.id);
  }

  async updateWorkout(userId: number, workoutId: number, updateWorkoutDto: UpdateWorkoutDto) {
    const workout = await this.sessionRepository.findOne({
      where: { id: workoutId, user_id: userId },
    });

    if (!workout) {
      throw new NotFoundException('训练记录不存在');
    }

    const { details, ...updateData } = updateWorkoutDto;

    // 更新会话信息
    if (updateData.workout_date) {
      updateData.workout_date = new Date(updateData.workout_date) as any;
    }
    
    await this.sessionRepository.update(workoutId, updateData);

    // 如果提供了新的明细，则删除旧的并创建新的
    if (details) {
      await this.detailRepository.delete({ session_id: workoutId });
      
      if (details.length > 0) {
        const workoutDetails = details.map((detail, index) =>
          this.detailRepository.create({
            session_id: workoutId,
            exercise_id: detail.exercise_id,
            weight: detail.weight,
            sets_count: detail.sets_count,
            reps: detail.reps,
            sort_order: detail.sort_order || index,
          }),
        );
        
        await this.detailRepository.save(workoutDetails);
      }
    }

    return await this.getWorkoutDetail(userId, workoutId);
  }

  async deleteWorkout(userId: number, workoutId: number) {
    const workout = await this.sessionRepository.findOne({
      where: { id: workoutId, user_id: userId },
    });

    if (!workout) {
      throw new NotFoundException('训练记录不存在');
    }

    // 先删除明细
    await this.detailRepository.delete({ session_id: workoutId });
    
    // 再删除会话
    await this.sessionRepository.delete(workoutId);
  }
}