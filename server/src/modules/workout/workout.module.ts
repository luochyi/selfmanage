import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutSession } from '../../entities/workout-session.entity';
import { WorkoutDetail } from '../../entities/workout-detail.entity';
import { WorkoutController } from './workout.controller';
import { WorkoutService } from './workout.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutSession, WorkoutDetail])],
  controllers: [WorkoutController],
  providers: [WorkoutService],
  exports: [WorkoutService],
})
export class WorkoutModule {}