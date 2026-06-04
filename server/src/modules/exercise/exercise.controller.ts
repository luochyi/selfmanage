import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../../entities/exercise.entity';

@Controller('exercises')
export class ExerciseController {
  constructor(
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
  ) {}

  @Get()
  async getExercises(@Query('bodyPartId') bodyPartId?: number) {
    const where = bodyPartId ? { body_part_id: bodyPartId } : {};
    
    const exercises = await this.exerciseRepository.find({
      where,
      relations: ['bodyPart'],
      order: { name: 'ASC' },
    });

    return {
      code: 0,
      message: 'success',
      data: exercises,
    };
  }
}