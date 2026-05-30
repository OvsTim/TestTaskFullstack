import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { IsDateRangeValid } from './is-date-range-valid.decorator';

export class QueryWorkEntriesDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Номер страницы (1-based)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Номер страницы должен быть целым числом' })
  @Min(1, { message: 'Номер страницы должен быть не меньше 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    description: 'Количество записей на странице (1–100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Лимит должен быть целым числом' })
  @Min(1, { message: 'Лимит должен быть не меньше 1' })
  @Max(100, { message: 'Лимит не должен превышать 100' })
  limit?: number = 20;

  @ApiPropertyOptional({
    example: '2026-05-01',
    description: 'Фильтр: дата выполнения ≥ from (ISO 8601, YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Дата «от» должна быть в формате ISO 8601 (YYYY-MM-DD)' })
  from?: string;

  @ApiPropertyOptional({
    example: '2026-05-31',
    description: 'Фильтр: дата выполнения ≤ to (ISO 8601, YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Дата «до» должна быть в формате ISO 8601 (YYYY-MM-DD)' })
  @IsDateRangeValid()
  to?: string;

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Сортировка по дате выполнения',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'Сортировка должна быть asc или desc' })
  sort?: 'asc' | 'desc' = 'desc';
}
