import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BodyPart } from '../../entities/body-part.entity';
import { BodyPartController } from './body-part.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BodyPart])],
  controllers: [BodyPartController],
})
export class BodyPartModule {}