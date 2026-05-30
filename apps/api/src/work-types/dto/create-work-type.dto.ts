import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateWorkTypeDto {
  @ApiProperty({ example: 'Кладка стены', maxLength: 500 })
  @IsString({ message: 'Название вида работ должно быть строкой' })
  @IsNotEmpty({ message: 'Название вида работ обязательно' })
  @MaxLength(500, {
    message: 'Название вида работ не должно превышать 500 символов',
  })
  name!: string;
}
