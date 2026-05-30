import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMeasurementUnitDto {
  @ApiPropertyOptional({ example: 'м³', maxLength: 50 })
  @IsOptional()
  @IsString({ message: 'Название единицы измерения должно быть строкой' })
  @IsNotEmpty({ message: 'Название единицы измерения не может быть пустым' })
  @MaxLength(50, {
    message: 'Название единицы измерения не должно превышать 50 символов',
  })
  name?: string;
}
