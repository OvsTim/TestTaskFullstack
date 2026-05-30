import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto';
import { CreateWorkEntryDto } from './dto/create-work-entry.dto';
import { QueryWorkEntriesDto } from './dto/query-work-entries.dto';
import { UpdateWorkEntryDto } from './dto/update-work-entry.dto';
import { WorkEntryIdParamDto } from './dto/work-entry-id-param.dto';
import { PaginatedWorkEntriesResponseDto } from './dto/paginated-work-entries-response.dto';
import { WorkEntryResponseDto } from './dto/work-entry-response.dto';
import { WorkEntriesService } from './work-entries.service';

@ApiTags('work-entries')
@Controller('work-entries')
export class WorkEntriesController {
  constructor(private readonly workEntriesService: WorkEntriesService) {}

  @Get()
  @ApiOperation({ summary: 'Список записей журнала' })
  @ApiOkResponse({ type: PaginatedWorkEntriesResponseDto })
  findAll(@Query() query: QueryWorkEntriesDto) {
    return this.workEntriesService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Создать запись' })
  @ApiBody({ type: CreateWorkEntryDto })
  @ApiCreatedResponse({ type: WorkEntryResponseDto })
  @ApiBadRequestResponse({
    description: 'Ошибка валидации тела запроса',
    type: ApiErrorResponseDto,
  })
  create(@Body() dto: CreateWorkEntryDto) {
    return this.workEntriesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить запись' })
  @ApiBody({ type: UpdateWorkEntryDto })
  @ApiOkResponse({ type: WorkEntryResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор или тело запроса',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Запись не найдена',
    type: ApiErrorResponseDto,
  })
  update(
    @Param() params: WorkEntryIdParamDto,
    @Body() dto: UpdateWorkEntryDto,
  ) {
    return this.workEntriesService.update(params.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить запись' })
  @ApiNoContentResponse({ description: 'Запись удалена' })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор записи',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Запись не найдена',
    type: ApiErrorResponseDto,
  })
  remove(@Param() params: WorkEntryIdParamDto) {
    return this.workEntriesService.remove(params.id);
  }
}
