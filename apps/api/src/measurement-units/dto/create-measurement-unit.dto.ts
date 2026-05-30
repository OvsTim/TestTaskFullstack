import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMeasurementUnitDto {
  @ApiProperty({ example: 'м³', maxLength: 50 })
  @IsString({ message: 'Название единицы измерения должно быть строкой' })
  @IsNotEmpty({ message: 'Название единицы измерения обязательно' })
  @MaxLength(50, {
    message: 'Название единицы измерения не должно превышать 50 символов',
  })
  name!: string;
}
