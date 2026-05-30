import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorMessages } from '../common/errors/error-messages';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkEntryDto } from './dto/create-work-entry.dto';
import { QueryWorkEntriesDto } from './dto/query-work-entries.dto';
import { UpdateWorkEntryDto } from './dto/update-work-entry.dto';

@Injectable()
export class WorkEntriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryWorkEntriesDto) {
    const where: Prisma.WorkEntryWhereInput = {};

    if (query.from || query.to) {
      where.completedAt = {};
      if (query.from) {
        where.completedAt.gte = new Date(query.from);
      }
      if (query.to) {
        where.completedAt.lte = new Date(query.to);
      }
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const orderBy = { completedAt: query.sort ?? 'desc' };

    const [total, data] = await Promise.all([
      this.prisma.workEntry.count({ where }),
      this.prisma.workEntry.findMany({ where, orderBy, skip, take: limit }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreateWorkEntryDto) {
    const workType = await this.prisma.workType.findUnique({
      where: { name: dto.workName },
    });
    if (!workType) {
      throw new BadRequestException(ErrorMessages.WORK_TYPE_NAME_UNKNOWN);
    }

    return this.prisma.workEntry.create({
      data: {
        completedAt: new Date(dto.completedAt),
        workName: dto.workName,
        volume: dto.volume,
        unit: dto.unit,
        performer: dto.performer,
      },
    });
  }

  async update(id: string, dto: UpdateWorkEntryDto) {
    const existing = await this.prisma.workEntry.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(ErrorMessages.WORK_ENTRY_NOT_FOUND);
    }

    const workType = await this.prisma.workType.findUnique({
      where: { name: dto.workName },
    });
    if (!workType) {
      throw new BadRequestException(ErrorMessages.WORK_TYPE_NAME_UNKNOWN);
    }

    return this.prisma.workEntry.update({
      where: { id },
      data: {
        completedAt: new Date(dto.completedAt),
        workName: dto.workName,
        volume: dto.volume,
        unit: dto.unit,
        performer: dto.performer,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.workEntry.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(ErrorMessages.WORK_ENTRY_NOT_FOUND);
    }

    return this.prisma.workEntry.delete({ where: { id } });
  }
}
