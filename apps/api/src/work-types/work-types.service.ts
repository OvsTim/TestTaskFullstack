import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorMessages } from '../common/errors/error-messages';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkTypeDto } from './dto/create-work-type.dto';
import { UpdateWorkTypeDto } from './dto/update-work-type.dto';

@Injectable()
export class WorkTypesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.workType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const workType = await this.prisma.workType.findUnique({ where: { id } });
    if (!workType) {
      throw new NotFoundException(ErrorMessages.WORK_TYPE_NOT_FOUND);
    }
    return workType;
  }

  async create(dto: CreateWorkTypeDto) {
    try {
      return await this.prisma.workType.create({
        data: { name: dto.name },
      });
    } catch (error) {
      this.handleUniqueViolation(error);
    }
  }

  async update(id: string, dto: UpdateWorkTypeDto) {
    const existing = await this.findOne(id);

    if (dto.name === undefined) {
      return existing;
    }

    try {
      return await this.prisma.workType.update({
        where: { id },
        data: { name: dto.name },
      });
    } catch (error) {
      this.handleUniqueViolation(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.workType.delete({ where: { id } });
  }

  private handleUniqueViolation(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(ErrorMessages.WORK_TYPE_NAME_EXISTS);
    }
    throw error;
  }
}
