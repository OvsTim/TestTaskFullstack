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
import { NotFoundErrorResponseDto } from '../common/dto/not-found-error-response.dto';
import { ValidationErrorResponseDto } from '../common/dto/validation-error-response.dto';
import { CreateWorkEntryDto } from './dto/create-work-entry.dto';
import { QueryWorkEntriesDto } from './dto/query-work-entries.dto';
import { WorkEntryIdParamDto } from './dto/work-entry-id-param.dto';
import { WorkEntryResponseDto } from './dto/work-entry-response.dto';
import { WorkEntriesService } from './work-entries.service';

@ApiTags('work-entries')
@Controller('work-entries')
export class WorkEntriesController {
  constructor(private readonly workEntriesService: WorkEntriesService) {}

  @Get()
  @ApiOperation({ summary: 'Список записей журнала' })
  @ApiOkResponse({ type: WorkEntryResponseDto, isArray: true })
  findAll(@Query() query: QueryWorkEntriesDto) {
    return this.workEntriesService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Создать запись' })
  @ApiBody({ type: CreateWorkEntryDto })
  @ApiCreatedResponse({ type: WorkEntryResponseDto })
  @ApiBadRequestResponse({
    description: 'Ошибка валидации тела запроса',
    type: ValidationErrorResponseDto,
  })
  create(@Body() dto: CreateWorkEntryDto) {
    return this.workEntriesService.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить запись' })
  @ApiNoContentResponse({ description: 'Запись удалена' })
  @ApiBadRequestResponse({
    description: 'Некорректный формат id',
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Запись с таким id не найдена',
    type: NotFoundErrorResponseDto,
  })
  remove(@Param() params: WorkEntryIdParamDto) {
    return this.workEntriesService.remove(params.id);
  }
}
