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
  @IsDateString({}, { message: 'Дата должна быть в формате ISO 8601 (YYYY-MM-DD)' })
  completedAt!: string;

  @ApiProperty({
    example: 'Кладка стены',
    maxLength: 500,
    description: 'Название вида работ из справочника (строковый снимок)',
  })
  @IsString({ message: 'Наименование работ должно быть строкой' })
  @IsNotEmpty({ message: 'Наименование работ обязательно' })
  @MaxLength(500, { message: 'Наименование работ не должно превышать 500 символов' })
  workName!: string;

  @ApiProperty({ example: 24, description: 'Объём работ (положительное число)' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Объём должен быть числом' })
  @IsPositive({ message: 'Объём должен быть положительным числом' })
  @Max(9999999999.99, { message: 'Объём превышает допустимое значение' })
  volume!: number;

  @ApiProperty({ example: 'м³', maxLength: 50 })
  @IsString({ message: 'Единица измерения должна быть строкой' })
  @IsNotEmpty({ message: 'Единица измерения обязательна' })
  @MaxLength(50, { message: 'Единица измерения не должна превышать 50 символов' })
  unit!: string;

  @ApiProperty({ example: 'Иванов И.И.', maxLength: 200 })
  @IsString({ message: 'Исполнитель должен быть строкой' })
  @IsNotEmpty({ message: 'Исполнитель обязателен' })
  @MaxLength(200, { message: 'Имя исполнителя не должно превышать 200 символов' })
  performer!: string;
}
