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
      relations: ['bodyPart', 'details', 'details.exercise'],
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

  async getWeeklyStats(userId: number, date: string) {
    // date 格式: 2026-06-08，计算该周的周一到周日
    const dateObj = new Date(date);
    const day = dateObj.getDay();
    const diff = day === 0 ? 6 : day - 1; // 周一为起始
    const monday = new Date(dateObj);
    monday.setDate(dateObj.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const workouts = await this.sessionRepository.find({
      where: {
        user_id: userId,
        workout_date: Between(monday, sunday),
      },
      relations: ['bodyPart', 'details', 'details.exercise'],
      order: { workout_date: 'ASC' },
    });

    // 统计各肌群训练次数
    const bodyPartStats: Record<string, { name: string; color: string; count: number }> = {};
    workouts.forEach(w => {
      const key = String(w.body_part_id);
      if (!bodyPartStats[key]) {
        bodyPartStats[key] = { name: w.bodyPart.name, color: w.bodyPart.color, count: 0 };
      }
      bodyPartStats[key].count++;
    });

    // 训练天数
    const trainingDays = new Set(workouts.map(w => w.workout_date)).size;

    // 总组数
    const totalSets = workouts.reduce((sum, w) => {
      return sum + (w.details || []).reduce((s, d) => s + (d.sets_count || 0), 0);
    }, 0);

    // 每日训练情况（周一到周日）
    const dailyWorkouts: { date: string; count: number; parts: string[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayWorkouts = workouts.filter(w => {
        const wd = new Date(w.workout_date);
        return wd.getFullYear() === d.getFullYear() && wd.getMonth() === d.getMonth() && wd.getDate() === d.getDate();
      });
      dailyWorkouts.push({
        date: dateStr,
        count: dayWorkouts.length,
        parts: dayWorkouts.map(w => w.bodyPart.name),
      });
    }

    return {
      weekStart: `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`,
      weekEnd: `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`,
      totalWorkouts: workouts.length,
      trainingDays,
      totalSets,
      bodyPartStats: Object.values(bodyPartStats),
      dailyWorkouts,
    };
  }

  async getMonthlyStats(userId: number, month: string) {
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
      relations: ['bodyPart', 'details', 'details.exercise'],
      order: { workout_date: 'ASC' },
    });

    // 统计各肌群训练次数
    const bodyPartStats: Record<string, { name: string; color: string; count: number }> = {};
    workouts.forEach(w => {
      const key = String(w.body_part_id);
      if (!bodyPartStats[key]) {
        bodyPartStats[key] = { name: w.bodyPart.name, color: w.bodyPart.color, count: 0 };
      }
      bodyPartStats[key].count++;
    });

    // 训练天数
    const trainingDays = new Set(workouts.map(w => w.workout_date)).size;

    // 总组数
    const totalSets = workouts.reduce((sum, w) => {
      return sum + (w.details || []).reduce((s, d) => s + (d.sets_count || 0), 0);
    }, 0);

    // 每周训练情况
    const daysInMonth = endDate.getDate();
    const weeklyStats: { week: string; count: number }[] = [];
    let weekStart = 1;
    while (weekStart <= daysInMonth) {
      let weekEnd = Math.min(weekStart + 6, daysInMonth);
      const wStart = new Date(startDate.getFullYear(), startDate.getMonth(), weekStart);
      const wEnd = new Date(startDate.getFullYear(), startDate.getMonth(), weekEnd);
      const weekWorkouts = workouts.filter(w => {
        const wd = new Date(w.workout_date);
        return wd >= wStart && wd <= wEnd;
      });
      weeklyStats.push({
        week: `${weekStart}-${weekEnd}日`,
        count: weekWorkouts.length,
      });
      weekStart = weekEnd + 1;
    }

    return {
      month,
      totalWorkouts: workouts.length,
      trainingDays,
      totalSets,
      bodyPartStats: Object.values(bodyPartStats),
      weeklyStats,
    };
  }
}