import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateWorkEntryDto {
  @IsDateString()
  completedAt!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  workName!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  volume!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unit!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  performer!: string;
}
