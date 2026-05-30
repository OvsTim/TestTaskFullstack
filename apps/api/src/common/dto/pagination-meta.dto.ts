import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 42, description: 'Общее количество записей' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Текущая страница (1-based)' })
  page!: number;

  @ApiProperty({ example: 20, description: 'Количество записей на странице' })
  limit!: number;

  @ApiProperty({ example: 3, description: 'Общее количество страниц' })
  totalPages!: number;
}
