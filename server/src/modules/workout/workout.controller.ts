import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateWorkoutDto, UpdateWorkoutDto } from './dto/workout.dto';

@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Get()
  async getMonthlyWorkouts(
    @Request() req,
    @Query('month') month: string,
  ) {
    const userId = req.user.userId;
    const workouts = await this.workoutService.getMonthlyWorkouts(userId, month);
    
    return {
      code: 0,
      message: 'success',
      data: workouts,
    };
  }

  @Get(':id')
  async getWorkoutDetail(
    @Request() req,
    @Param('id') id: number,
  ) {
    const userId = req.user.userId;
    const workout = await this.workoutService.getWorkoutDetail(userId, id);
    
    return {
      code: 0,
      message: 'success',
      data: workout,
    };
  }

  @Post()
  async createWorkout(
    @Request() req,
    @Body() createWorkoutDto: CreateWorkoutDto,
  ) {
    const userId = req.user.userId;
    const workout = await this.workoutService.createWorkout(userId, createWorkoutDto);
    
    return {
      code: 0,
      message: '创建成功',
      data: workout,
    };
  }

  @Put(':id')
  async updateWorkout(
    @Request() req,
    @Param('id') id: number,
    @Body() updateWorkoutDto: UpdateWorkoutDto,
  ) {
    const userId = req.user.userId;
    const workout = await this.workoutService.updateWorkout(userId, id, updateWorkoutDto);
    
    return {
      code: 0,
      message: '更新成功',
      data: workout,
    };
  }

  @Delete(':id')
  async deleteWorkout(
    @Request() req,
    @Param('id') id: number,
  ) {
    const userId = req.user.userId;
    await this.workoutService.deleteWorkout(userId, id);
    
    return {
      code: 0,
      message: '删除成功',
    };
  }
}