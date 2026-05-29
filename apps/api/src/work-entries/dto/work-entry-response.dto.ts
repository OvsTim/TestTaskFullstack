import { ApiProperty } from '@nestjs/swagger';

export class WorkEntryResponseDto {
  @ApiProperty({ example: 'clxyz1234567890' })
  id!: string;

  @ApiProperty({ example: '2026-05-29T00:00:00.000Z' })
  completedAt!: Date;

  @ApiProperty({ example: 'Кладка стены' })
  workName!: string;

  @ApiProperty({
    example: '24.00',
    description: 'Prisma Decimal сериализуется в JSON как строка',
  })
  volume!: string;

  @ApiProperty({ example: 'м³' })
  unit!: string;

  @ApiProperty({ example: 'Иванов И.И.' })
  performer!: string;

  @ApiProperty({ example: '2026-05-29T12:00:00.000Z' })
  createdAt!: Date;
}
