import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateWorkTypeDto {
  @ApiPropertyOptional({ example: 'Кладка стены', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'Название вида работ должно быть строкой' })
  @IsNotEmpty({ message: 'Название вида работ не может быть пустым' })
  @MaxLength(500, {
    message: 'Название вида работ не должно превышать 500 символов',
  })
  name?: string;
}
