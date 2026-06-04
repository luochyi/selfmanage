import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BodyPart } from '../../entities/body-part.entity';

@Controller('body-parts')
export class BodyPartController {
  constructor(
    @InjectRepository(BodyPart)
    private readonly bodyPartRepository: Repository<BodyPart>,
  ) {}

  @Get()
  async getBodyParts() {
    const bodyParts = await this.bodyPartRepository.find({
      order: { id: 'ASC' },
    });

    return {
      code: 0,
      message: 'success',
      data: bodyParts,
    };
  }
}