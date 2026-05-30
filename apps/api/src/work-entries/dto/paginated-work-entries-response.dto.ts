import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/pagination-meta.dto';
import { WorkEntryResponseDto } from './work-entry-response.dto';

export class PaginatedWorkEntriesResponseDto {
  @ApiProperty({ type: WorkEntryResponseDto, isArray: true })
  data!: WorkEntryResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
