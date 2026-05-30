import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorMessages } from '../src/common/errors/error-messages';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './utils/create-test-app';
import {
  INVALID_CUID,
  NON_EXISTENT_CUID,
  validCreateWorkEntry,
} from './utils/fixtures';
import { expectError } from './utils/expect-http';
import { resetDatabase } from './utils/reset-database';

describe('WorkEntries (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    await prisma.workType.create({ data: { name: validCreateWorkEntry.workName } });
  });

  afterAll(async () => {
    await app.close();
  });

  async function ensureWorkType(name: string) {
    await prisma.workType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  async function createEntry(
    overrides: Partial<typeof validCreateWorkEntry> = {},
  ) {
    const body = { ...validCreateWorkEntry, ...overrides };
    await ensureWorkType(body.workName);
    const response = await request(app.getHttpServer())
      .post('/api/work-entries')
      .send(body)
      .expect(201);
    return { body, response };
  }

  describe('happy path', () => {
    it('POST creates work entry', async () => {
      const { body, response } = await createEntry();

      expect(response.body).toMatchObject({
        workName: body.workName,
        unit: body.unit,
        performer: body.performer,
      });
      expect(response.body.id).toMatch(/^c[a-z0-9]{24}$/);
      expect(String(response.body.volume)).toBe(String(body.volume));
      expect(response.body.completedAt).toBeDefined();
    });

    it('GET list includes created entry', async () => {
      const { response: created } = await createEntry();

      const listResponse = await request(app.getHttpServer())
        .get('/api/work-entries')
        .expect(200);

      expect(listResponse.body.data).toHaveLength(1);
      expect(listResponse.body.data[0].id).toBe(created.body.id);
      expect(listResponse.body.meta).toMatchObject({
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('DELETE removes entry', async () => {
      const { response: created } = await createEntry();

      await request(app.getHttpServer())
        .delete(`/api/work-entries/${created.body.id}`)
        .expect(204);

      const deleteAgain = await request(app.getHttpServer()).delete(
        `/api/work-entries/${created.body.id}`,
      );
      expectError(deleteAgain, 404, ErrorMessages.WORK_ENTRY_NOT_FOUND);
    });

    it('filters by from and to', async () => {
      await createEntry({ completedAt: '2026-05-01', workName: 'A' });
      await createEntry({ completedAt: '2026-05-15', workName: 'B' });
      await createEntry({ completedAt: '2026-06-01', workName: 'C' });

      const response = await request(app.getHttpServer())
        .get('/api/work-entries')
        .query({ from: '2026-05-10', to: '2026-05-20' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].workName).toBe('B');
    });

    it('sorts by completedAt asc and desc', async () => {
      await createEntry({ completedAt: '2026-05-01', workName: 'early' });
      await createEntry({ completedAt: '2026-05-31', workName: 'late' });

      const asc = await request(app.getHttpServer())
        .get('/api/work-entries')
        .query({ sort: 'asc' })
        .expect(200);
      expect(asc.body.data.map((e: { workName: string }) => e.workName)).toEqual(
        ['early', 'late'],
      );

      const desc = await request(app.getHttpServer())
        .get('/api/work-entries')
        .query({ sort: 'desc' })
        .expect(200);
      expect(
        desc.body.data.map((e: { workName: string }) => e.workName),
      ).toEqual(['late', 'early']);
    });

    it('paginates results', async () => {
      for (let i = 1; i <= 5; i++) {
        await createEntry({
          completedAt: `2026-05-0${i}`,
          workName: `work-${i}`,
        });
      }

      const page1 = await request(app.getHttpServer())
        .get('/api/work-entries')
        .query({ limit: 2, page: 1, sort: 'asc' })
        .expect(200);
      expect(page1.body.data).toHaveLength(2);
      expect(page1.body.meta).toMatchObject({
        total: 5,
        page: 1,
        limit: 2,
        totalPages: 3,
      });

      const page2 = await request(app.getHttpServer())
        .get('/api/work-entries')
        .query({ limit: 2, page: 2, sort: 'asc' })
        .expect(200);
      expect(page2.body.data).toHaveLength(2);
      expect(page2.body.meta.page).toBe(2);
    });

    it('PATCH updates all fields and returns updated entry', async () => {
      const { response: created } = await createEntry();
      const originalCreatedAt = created.body.createdAt;

      await ensureWorkType('Бетонирование');

      const updatedBody = {
        completedAt: '2026-06-15',
        workName: 'Бетонирование',
        volume: 48.5,
        unit: 'м²',
        performer: 'Петров П.П.',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send(updatedBody)
        .expect(200);

      expect(response.body).toMatchObject({
        id: created.body.id,
        workName: updatedBody.workName,
        unit: updatedBody.unit,
        performer: updatedBody.performer,
        createdAt: originalCreatedAt,
      });
      expect(String(response.body.volume)).toBe(String(updatedBody.volume));
      expect(response.body.completedAt).toBeDefined();
    });

    it('PATCH changes are visible in GET list', async () => {
      const { response: created } = await createEntry();

      await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({ ...validCreateWorkEntry, performer: 'Сидоров С.С.' })
        .expect(200);

      const listResponse = await request(app.getHttpServer())
        .get('/api/work-entries')
        .expect(200);

      expect(listResponse.body.data).toHaveLength(1);
      expect(listResponse.body.data[0].performer).toBe('Сидоров С.С.');
    });

    it('rejects legacy workName when work type was removed from dictionary', async () => {
      const { response: created } = await createEntry({
        workName: 'Устаревший вид',
      });

      await prisma.workType.deleteMany({ where: { name: 'Устаревший вид' } });

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({
          ...validCreateWorkEntry,
          workName: 'Устаревший вид',
          volume: 10,
        });

      expectError(response, 400, ErrorMessages.WORK_TYPE_NAME_UNKNOWN);
    });

    it('PATCH updates workName to another dictionary value', async () => {
      const { response: created } = await createEntry();
      await ensureWorkType('Арматурные работы');

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({ ...validCreateWorkEntry, workName: 'Арматурные работы' })
        .expect(200);

      expect(response.body.workName).toBe('Арматурные работы');
    });
  });

  describe('POST validation (400)', () => {
    it('rejects empty body', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-entries')
        .send({});
      expectError(response, 400);
    });

    it('rejects invalid completedAt', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-entries')
        .send({ ...validCreateWorkEntry, completedAt: 'not-a-date' });
      expectError(response, 400, 'ISO 8601');
    });

    it('rejects empty workName', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-entries')
        .send({ ...validCreateWorkEntry, workName: '' });
      expectError(response, 400);
    });

    it('rejects unknown workName not in dictionary', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-entries')
        .send({ ...validCreateWorkEntry, workName: 'Несуществующий вид работ' });
      expectError(response, 400, ErrorMessages.WORK_TYPE_NAME_UNKNOWN);
    });

    it('rejects empty unit', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-entries')
        .send({ ...validCreateWorkEntry, unit: '' });
      expectError(response, 400);
    });

    it('rejects empty performer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-entries')
        .send({ ...validCreateWorkEntry, performer: '' });
      expectError(response, 400);
    });

    it('rejects zero volume', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-entries')
        .send({ ...validCreateWorkEntry, volume: 0 });
      expectError(response, 400, 'положительным');
    });

    it('rejects negative volume', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-entries')
        .send({ ...validCreateWorkEntry, volume: -1 });
      expectError(response, 400);
    });

    it('rejects volume with more than 2 decimal places', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-entries')
        .send({ ...validCreateWorkEntry, volume: 1.234 });
      expectError(response, 400);
    });

    it('rejects volume above maximum', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-entries')
        .send({ ...validCreateWorkEntry, volume: 10000000000 });
      expectError(response, 400);
    });

    it('rejects workName longer than 500 characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-entries')
        .send({ ...validCreateWorkEntry, workName: 'a'.repeat(501) });
      expectError(response, 400, '500');
    });

    it('rejects unit longer than 50 characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-entries')
        .send({ ...validCreateWorkEntry, unit: 'a'.repeat(51) });
      expectError(response, 400, '50');
    });

    it('rejects performer longer than 200 characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-entries')
        .send({ ...validCreateWorkEntry, performer: 'a'.repeat(201) });
      expectError(response, 400, '200');
    });

    it('rejects extra properties', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-entries')
        .send({ ...validCreateWorkEntry, extra: true });
      expectError(response, 400);
    });

    it('accepts volume with exactly 2 decimal places', async () => {
      await request(app.getHttpServer())
        .post('/api/work-entries')
        .send({ ...validCreateWorkEntry, volume: 12.34 })
        .expect(201);
    });
  });

  describe('GET query validation (400)', () => {
    it('rejects page=0', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/work-entries')
        .query({ page: 0 });
      expectError(response, 400);
    });

    it('rejects limit=0', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/work-entries')
        .query({ limit: 0 });
      expectError(response, 400);
    });

    it('rejects limit=101', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/work-entries')
        .query({ limit: 101 });
      expectError(response, 400, '100');
    });

    it('rejects invalid sort', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/work-entries')
        .query({ sort: 'invalid' });
      expectError(response, 400, 'asc или desc');
    });

    it('rejects invalid from date', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/work-entries')
        .query({ from: 'bad-date' });
      expectError(response, 400);
    });

    it('rejects invalid to date', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/work-entries')
        .query({ to: 'bad-date' });
      expectError(response, 400);
    });

    it('rejects from later than to', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/work-entries')
        .query({ from: '2026-05-31', to: '2026-05-01' });
      expectError(response, 400, 'Дата «от» не может быть позже даты «до»');
    });
  });

  describe('PATCH validation (400)', () => {
    it('rejects empty body', async () => {
      const { response: created } = await createEntry();

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({});
      expectError(response, 400);
    });

    it('rejects invalid completedAt', async () => {
      const { response: created } = await createEntry();

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({ ...validCreateWorkEntry, completedAt: 'not-a-date' });
      expectError(response, 400, 'ISO 8601');
    });

    it('rejects empty workName', async () => {
      const { response: created } = await createEntry();

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({ ...validCreateWorkEntry, workName: '' });
      expectError(response, 400);
    });

    it('rejects unknown workName not in dictionary', async () => {
      const { response: created } = await createEntry();

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({ ...validCreateWorkEntry, workName: 'Несуществующий вид работ' });
      expectError(response, 400, ErrorMessages.WORK_TYPE_NAME_UNKNOWN);
    });

    it('rejects empty unit', async () => {
      const { response: created } = await createEntry();

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({ ...validCreateWorkEntry, unit: '' });
      expectError(response, 400);
    });

    it('rejects empty performer', async () => {
      const { response: created } = await createEntry();

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({ ...validCreateWorkEntry, performer: '' });
      expectError(response, 400);
    });

    it('rejects zero volume', async () => {
      const { response: created } = await createEntry();

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({ ...validCreateWorkEntry, volume: 0 });
      expectError(response, 400, 'положительным');
    });

    it('rejects negative volume', async () => {
      const { response: created } = await createEntry();

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({ ...validCreateWorkEntry, volume: -1 });
      expectError(response, 400);
    });

    it('rejects volume with more than 2 decimal places', async () => {
      const { response: created } = await createEntry();

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({ ...validCreateWorkEntry, volume: 1.234 });
      expectError(response, 400);
    });

    it('rejects volume above maximum', async () => {
      const { response: created } = await createEntry();

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({ ...validCreateWorkEntry, volume: 10000000000 });
      expectError(response, 400);
    });

    it('rejects workName longer than 500 characters', async () => {
      const { response: created } = await createEntry();

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({ ...validCreateWorkEntry, workName: 'a'.repeat(501) });
      expectError(response, 400, '500');
    });

    it('rejects unit longer than 50 characters', async () => {
      const { response: created } = await createEntry();

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({ ...validCreateWorkEntry, unit: 'a'.repeat(51) });
      expectError(response, 400, '50');
    });

    it('rejects performer longer than 200 characters', async () => {
      const { response: created } = await createEntry();

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({ ...validCreateWorkEntry, performer: 'a'.repeat(201) });
      expectError(response, 400, '200');
    });

    it('rejects extra properties', async () => {
      const { response: created } = await createEntry();

      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${created.body.id}`)
        .send({ ...validCreateWorkEntry, extra: true });
      expectError(response, 400);
    });
  });

  describe('PATCH id handling', () => {
    it('rejects invalid id format', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${INVALID_CUID}`)
        .send(validCreateWorkEntry);
      expectError(response, 400, ErrorMessages.INVALID_WORK_ENTRY_ID);
    });

    it('returns 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/work-entries/${NON_EXISTENT_CUID}`)
        .send(validCreateWorkEntry);
      expectError(response, 404, ErrorMessages.WORK_ENTRY_NOT_FOUND);
    });
  });

  describe('DELETE id handling', () => {
    it('rejects invalid id format', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/api/work-entries/${INVALID_CUID}`,
      );
      expectError(response, 400, ErrorMessages.INVALID_WORK_ENTRY_ID);
    });

    it('returns 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/api/work-entries/${NON_EXISTENT_CUID}`,
      );
      expectError(response, 404, ErrorMessages.WORK_ENTRY_NOT_FOUND);
    });
  });

  describe('edge cases', () => {
    it('returns empty list with zero totals', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/work-entries')
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.meta).toMatchObject({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
    });

    it('returns empty data for page beyond total', async () => {
      await createEntry();

      const response = await request(app.getHttpServer())
        .get('/api/work-entries')
        .query({ page: 99 })
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(1);
    });

    it('accepts limit=100', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/work-entries')
        .query({ limit: 100 })
        .expect(200);

      expect(response.body.meta.limit).toBe(100);
    });
  });
});
