import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateWorkEntryDto } from './dto/create-work-entry.dto';
import { QueryWorkEntriesDto } from './dto/query-work-entries.dto';
import { WorkEntriesService } from './work-entries.service';

@Controller('work-entries')
export class WorkEntriesController {
  constructor(private readonly workEntriesService: WorkEntriesService) {}

  @Get()
  findAll(@Query() query: QueryWorkEntriesDto) {
    return this.workEntriesService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateWorkEntryDto) {
    return this.workEntriesService.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.workEntriesService.remove(id);
  }
}
