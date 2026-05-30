import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorMessages } from '../common/errors/error-messages';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeasurementUnitDto } from './dto/create-measurement-unit.dto';
import { UpdateMeasurementUnitDto } from './dto/update-measurement-unit.dto';

@Injectable()
export class MeasurementUnitsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.measurementUnit.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const unit = await this.prisma.measurementUnit.findUnique({ where: { id } });
    if (!unit) {
      throw new NotFoundException(ErrorMessages.MEASUREMENT_UNIT_NOT_FOUND);
    }
    return unit;
  }

  async create(dto: CreateMeasurementUnitDto) {
    try {
      return await this.prisma.measurementUnit.create({
        data: { name: dto.name },
      });
    } catch (error) {
      this.handleUniqueViolation(error);
    }
  }

  async update(id: string, dto: UpdateMeasurementUnitDto) {
    const existing = await this.findOne(id);

    if (dto.name === undefined) {
      return existing;
    }

    try {
      return await this.prisma.measurementUnit.update({
        where: { id },
        data: { name: dto.name },
      });
    } catch (error) {
      this.handleUniqueViolation(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.measurementUnit.delete({ where: { id } });
  }

  private handleUniqueViolation(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(ErrorMessages.MEASUREMENT_UNIT_NAME_EXISTS);
    }
    throw error;
  }
}
