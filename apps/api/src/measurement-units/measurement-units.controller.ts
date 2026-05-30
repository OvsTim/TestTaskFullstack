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
import { CreateMeasurementUnitDto } from './dto/create-measurement-unit.dto';
import { MeasurementUnitIdParamDto } from './dto/measurement-unit-id-param.dto';
import { MeasurementUnitResponseDto } from './dto/measurement-unit-response.dto';
import { UpdateMeasurementUnitDto } from './dto/update-measurement-unit.dto';
import { MeasurementUnitsService } from './measurement-units.service';

@ApiTags('measurement-units')
@Controller('measurement-units')
export class MeasurementUnitsController {
  constructor(
    private readonly measurementUnitsService: MeasurementUnitsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Список единиц измерения' })
  @ApiOkResponse({ type: [MeasurementUnitResponseDto] })
  findAll() {
    return this.measurementUnitsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить единицу измерения по id' })
  @ApiOkResponse({ type: MeasurementUnitResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Единица измерения не найдена',
    type: ApiErrorResponseDto,
  })
  findOne(@Param() params: MeasurementUnitIdParamDto) {
    return this.measurementUnitsService.findOne(params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать единицу измерения' })
  @ApiBody({ type: CreateMeasurementUnitDto })
  @ApiCreatedResponse({ type: MeasurementUnitResponseDto })
  @ApiBadRequestResponse({
    description: 'Ошибка валидации тела запроса',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Единица с таким названием уже существует',
    type: ApiErrorResponseDto,
  })
  create(@Body() dto: CreateMeasurementUnitDto) {
    return this.measurementUnitsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить единицу измерения' })
  @ApiBody({ type: UpdateMeasurementUnitDto })
  @ApiOkResponse({ type: MeasurementUnitResponseDto })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор или тело запроса',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Единица измерения не найдена',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Единица с таким названием уже существует',
    type: ApiErrorResponseDto,
  })
  update(
    @Param() params: MeasurementUnitIdParamDto,
    @Body() dto: UpdateMeasurementUnitDto,
  ) {
    return this.measurementUnitsService.update(params.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить единицу измерения' })
  @ApiNoContentResponse({ description: 'Единица измерения удалена' })
  @ApiBadRequestResponse({
    description: 'Некорректный идентификатор',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Единица измерения не найдена',
    type: ApiErrorResponseDto,
  })
  remove(@Param() params: MeasurementUnitIdParamDto) {
    return this.measurementUnitsService.remove(params.id);
  }
}
