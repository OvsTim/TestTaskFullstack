import { ApiProperty } from '@nestjs/swagger';

export class MeasurementUnitResponseDto {
  @ApiProperty({ example: 'clxyz1234567890' })
  id!: string;

  @ApiProperty({ example: 'м³' })
  name!: string;

  @ApiProperty({ example: '2026-05-29T12:00:00.000Z' })
  createdAt!: Date;
}
