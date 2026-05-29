import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkEntryDto } from './dto/create-work-entry.dto';
import { QueryWorkEntriesDto } from './dto/query-work-entries.dto';

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

    return this.prisma.workEntry.findMany({
      where,
      orderBy: { completedAt: query.sort ?? 'desc' },
    });
  }

  async create(dto: CreateWorkEntryDto) {
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

  async remove(id: string) {
    try {
      return await this.prisma.workEntry.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`Work entry ${id} not found`);
    }
  }
}
