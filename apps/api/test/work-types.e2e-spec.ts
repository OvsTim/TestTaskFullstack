import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorMessages } from '../src/common/errors/error-messages';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './utils/create-test-app';
import {
  INVALID_CUID,
  NON_EXISTENT_CUID,
  validCreateWorkType,
} from './utils/fixtures';
import { expectError } from './utils/expect-http';
import { resetDatabase } from './utils/reset-database';

describe('WorkTypes (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('happy path', () => {
    it('POST creates work type', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-types')
        .send(validCreateWorkType)
        .expect(201);

      expect(response.body).toMatchObject({
        name: validCreateWorkType.name,
      });
      expect(response.body.id).toMatch(/^c[a-z0-9]{24}$/);
      expect(response.body.createdAt).toBeDefined();
    });

    it('GET list returns work types sorted by name asc', async () => {
      await prisma.workType.createMany({
        data: [
          { name: 'Бетонирование' },
          { name: 'Арматурные работы' },
          { name: 'Кладка стены' },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/api/work-types')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body.map((t: { name: string }) => t.name)).toEqual([
        'Арматурные работы',
        'Бетонирование',
        'Кладка стены',
      ]);
    });

    it('GET :id returns work type', async () => {
      const created = await prisma.workType.create({
        data: { name: 'Монтаж опалубки' },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/work-types/${created.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: created.id,
        name: 'Монтаж опалубки',
      });
    });

    it('PATCH updates name', async () => {
      const created = await prisma.workType.create({
        data: { name: 'Кладка перегородок' },
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/work-types/${created.id}`)
        .send({ name: 'Кладка стены' })
        .expect(200);

      expect(response.body).toMatchObject({
        id: created.id,
        name: 'Кладка стены',
      });
    });

    it('PATCH with empty body returns unchanged work type', async () => {
      const created = await prisma.workType.create({
        data: { name: 'Бетонирование' },
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/work-types/${created.id}`)
        .send({})
        .expect(200);

      expect(response.body).toMatchObject({
        id: created.id,
        name: 'Бетонирование',
      });
    });

    it('DELETE removes work type', async () => {
      const created = await prisma.workType.create({
        data: { name: 'Арматурные работы' },
      });

      await request(app.getHttpServer())
        .delete(`/api/work-types/${created.id}`)
        .expect(204);

      const getResponse = await request(app.getHttpServer()).get(
        `/api/work-types/${created.id}`,
      );
      expectError(getResponse, 404, ErrorMessages.WORK_TYPE_NOT_FOUND);
    });
  });

  describe('validation (400)', () => {
    it('POST rejects missing name', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-types')
        .send({});
      expectError(response, 400);
    });

    it('POST rejects empty name', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-types')
        .send({ name: '' });
      expectError(response, 400);
    });

    it('POST rejects name longer than 500 characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-types')
        .send({ name: 'a'.repeat(501) });
      expectError(response, 400, '500 символов');
    });

    it('PATCH rejects empty name', async () => {
      const created = await prisma.workType.create({
        data: { name: 'Кладка стены' },
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/work-types/${created.id}`)
        .send({ name: '' });
      expectError(response, 400);
    });

    it('POST rejects extra properties', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/work-types')
        .send({ ...validCreateWorkType, extra: true });
      expectError(response, 400);
    });

    it('GET rejects invalid id format', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/work-types/${INVALID_CUID}`,
      );
      expectError(response, 400, ErrorMessages.INVALID_WORK_TYPE_ID);
    });

    it('GET rejects uppercase CUID', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/work-types/Caaaaaaaaaaaaaaaaaaaaaaa',
      );
      expectError(response, 400, ErrorMessages.INVALID_WORK_TYPE_ID);
    });
  });

  describe('not found (404)', () => {
    it('GET returns 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/work-types/${NON_EXISTENT_CUID}`,
      );
      expectError(response, 404, ErrorMessages.WORK_TYPE_NOT_FOUND);
    });

    it('PATCH returns 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/work-types/${NON_EXISTENT_CUID}`)
        .send({ name: 'новое' });
      expectError(response, 404, ErrorMessages.WORK_TYPE_NOT_FOUND);
    });

    it('DELETE returns 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/api/work-types/${NON_EXISTENT_CUID}`,
      );
      expectError(response, 404, ErrorMessages.WORK_TYPE_NOT_FOUND);
    });
  });

  describe('conflict (409)', () => {
    it('POST returns 409 for duplicate name', async () => {
      await request(app.getHttpServer())
        .post('/api/work-types')
        .send({ name: 'дубликат' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/work-types')
        .send({ name: 'дубликат' });
      expectError(response, 409, ErrorMessages.WORK_TYPE_NAME_EXISTS);
    });

    it('PATCH returns 409 when renaming to existing name', async () => {
      await prisma.workType.createMany({
        data: [{ name: 'тип-A' }, { name: 'тип-B' }],
      });
      const workTypes = await prisma.workType.findMany({
        orderBy: { name: 'asc' },
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/work-types/${workTypes[1].id}`)
        .send({ name: 'тип-A' });
      expectError(response, 409, ErrorMessages.WORK_TYPE_NAME_EXISTS);
    });
  });
});
