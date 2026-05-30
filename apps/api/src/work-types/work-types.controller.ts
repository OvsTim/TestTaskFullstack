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
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto';
import { CreateWorkTypeDto } from './dto/create-work-type.dto';
import { UpdateWorkTypeDto } from './dto/update-work-type.dto';
import { WorkTypeIdParamDto } from './dto/work-type-id-param.dto';
import { WorkTypeResponseDto } from './dto/work-type-response.dto';
import { WorkTypesService } from './work-types.service';

@ApiTags('work-types')
@Controller('work-types')
export class WorkTypesController {
  constructor(private readonly workTypesService: WorkTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Список видов работ' })
  @ApiOkResponse({ type: [WorkTypeResponseDto] })
  findAll() {
    return this.workTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить вид работ по id' })
  @ApiOkResponse({ type: WorkTypeResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Вид работ не найден',
    type: ApiErrorResponseDto,
  })
  findOne(@Param() params: WorkTypeIdParamDto) {
    return this.workTypesService.findOne(params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать вид работ' })
  @ApiBody({ type: CreateWorkTypeDto })
  @ApiCreatedResponse({ type: WorkTypeResponseDto })
  @ApiBadRequestResponse({
    description: 'Ошибка валидации тела запроса',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Вид работ с таким названием уже существует',
    type: ApiErrorResponseDto,
  })
  create(@Body() dto: CreateWorkTypeDto) {
    return this.workTypesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить вид работ' })
  @ApiBody({ type: UpdateWorkTypeDto })
  @ApiOkResponse({ type: WorkTypeResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор или тело запроса',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Вид работ не найден',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Вид работ с таким названием уже существует',
    type: ApiErrorResponseDto,
  })
  update(
    @Param() params: WorkTypeIdParamDto,
    @Body() dto: UpdateWorkTypeDto,
  ) {
    return this.workTypesService.update(params.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить вид работ' })
  @ApiNoContentResponse({ description: 'Вид работ удалён' })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Вид работ не найден',
    type: ApiErrorResponseDto,
  })
  remove(@Param() params: WorkTypeIdParamDto) {
    return this.workTypesService.remove(params.id);
  }
}
