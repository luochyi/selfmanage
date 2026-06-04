import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from '../../entities/exercise.entity';
import { ExerciseController } from './exercise.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise])],
  controllers: [ExerciseController],
})
export class ExerciseModule {}