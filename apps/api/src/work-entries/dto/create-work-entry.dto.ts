import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateWorkEntryDto {
  @ApiProperty({
    example: '2026-05-29',
    description: 'Дата выполнения работ (ISO 8601, YYYY-MM-DD)',
  })
  @IsDateString()
  completedAt!: string;

  @ApiProperty({ example: 'Кладка стены', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  workName!: string;

  @ApiProperty({ example: 24, description: 'Объём работ (положительное число)' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(9999999999.99)
  volume!: number;

  @ApiProperty({ example: 'м³', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unit!: string;

  @ApiProperty({ example: 'Иванов И.И.', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  performer!: string;
}
