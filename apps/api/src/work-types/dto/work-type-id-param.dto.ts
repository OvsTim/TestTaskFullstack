import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ErrorMessages } from '../../common/errors/error-messages';

/** Prisma @default(cuid()) */
const CUID_PATTERN = /^c[a-z0-9]{24}$/;

export class WorkTypeIdParamDto {
  @ApiProperty({
    example: 'clxyz1234567890abcdef',
    description: 'Идентификатор вида работ (cuid)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(CUID_PATTERN, { message: ErrorMessages.INVALID_WORK_TYPE_ID })
  id!: string;
}
