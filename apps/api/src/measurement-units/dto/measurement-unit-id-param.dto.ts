import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ErrorMessages } from '../../common/errors/error-messages';

/** Prisma @default(cuid()) */
const CUID_PATTERN = /^c[a-z0-9]{24}$/;

export class MeasurementUnitIdParamDto {
  @ApiProperty({
    example: 'clxyz1234567890abcdef',
    description: 'Идентификатор единицы измерения (cuid)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(CUID_PATTERN, { message: ErrorMessages.INVALID_MEASUREMENT_UNIT_ID })
  id!: string;
}
