import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

/** Prisma @default(cuid()) */
const CUID_PATTERN = /^c[a-z0-9]{24}$/;

export class WorkEntryIdParamDto {
  @ApiProperty({
    example: 'clxyz1234567890abcdef',
    description: 'Идентификатор записи (cuid)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(CUID_PATTERN, { message: 'id must be a valid cuid' })
  id!: string;
}
