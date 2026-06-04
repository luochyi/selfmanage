import { IsNumber, IsString, IsArray, ValidateNested, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWorkoutDetailDto {
  @IsNumber()
  exercise_id: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  sets_count?: number;

  @IsOptional()
  @IsNumber()
  reps?: number;

  @IsOptional()
  @IsNumber()
  sort_order?: number;
}

export class CreateWorkoutDto {
  @IsDateString()
  workout_date: string;

  @IsNumber()
  body_part_id: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutDetailDto)
  details: CreateWorkoutDetailDto[];
}

export class UpdateWorkoutDto {
  @IsOptional()
  @IsDateString()
  workout_date?: string;

  @IsOptional()
  @IsNumber()
  body_part_id?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutDetailDto)
  details?: CreateWorkoutDetailDto[];
}