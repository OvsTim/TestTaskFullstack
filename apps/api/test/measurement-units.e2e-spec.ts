import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ErrorMessages } from '../src/common/errors/error-messages';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './utils/create-test-app';
import {
  INVALID_CUID,
  NON_EXISTENT_CUID,
  validCreateMeasurementUnit,
} from './utils/fixtures';
import { expectError } from './utils/expect-http';
import { resetDatabase } from './utils/reset-database';

describe('MeasurementUnits (e2e)', () => {
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
    it('POST creates unit', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/measurement-units')
        .send(validCreateMeasurementUnit)
        .expect(201);

      expect(response.body).toMatchObject({
        name: validCreateMeasurementUnit.name,
      });
      expect(response.body.id).toMatch(/^c[a-z0-9]{24}$/);
      expect(response.body.createdAt).toBeDefined();
    });

    it('GET list returns units sorted by name asc', async () => {
      await prisma.measurementUnit.createMany({
        data: [{ name: 'шт' }, { name: 'м³' }, { name: 'м²' }],
      });

      const response = await request(app.getHttpServer())
        .get('/api/measurement-units')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body.map((u: { name: string }) => u.name)).toEqual([
        'м²',
        'м³',
        'шт',
      ]);
    });

    it('GET :id returns unit', async () => {
      const created = await prisma.measurementUnit.create({
        data: { name: 'кг' },
      });

      const response = await request(app.getHttpServer())
        .get(`/api/measurement-units/${created.id}`)
        .expect(200);

      expect(response.body).toMatchObject({ id: created.id, name: 'кг' });
    });

    it('PATCH updates name', async () => {
      const created = await prisma.measurementUnit.create({
        data: { name: 'м' },
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/measurement-units/${created.id}`)
        .send({ name: 'км' })
        .expect(200);

      expect(response.body).toMatchObject({ id: created.id, name: 'км' });
    });

    it('PATCH with empty body returns unchanged unit', async () => {
      const created = await prisma.measurementUnit.create({
        data: { name: 'л' },
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/measurement-units/${created.id}`)
        .send({})
        .expect(200);

      expect(response.body).toMatchObject({ id: created.id, name: 'л' });
    });

    it('DELETE removes unit', async () => {
      const created = await prisma.measurementUnit.create({
        data: { name: 'упак' },
      });

      await request(app.getHttpServer())
        .delete(`/api/measurement-units/${created.id}`)
        .expect(204);

      const getResponse = await request(app.getHttpServer()).get(
        `/api/measurement-units/${created.id}`,
      );
      expectError(
        getResponse,
        404,
        ErrorMessages.MEASUREMENT_UNIT_NOT_FOUND,
      );
    });
  });

  describe('validation (400)', () => {
    it('POST rejects missing name', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/measurement-units')
        .send({});
      expectError(response, 400);
    });

    it('POST rejects empty name', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/measurement-units')
        .send({ name: '' });
      expectError(response, 400);
    });

    it('POST rejects name longer than 50 characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/measurement-units')
        .send({ name: 'a'.repeat(51) });
      expectError(response, 400, '50 символов');
    });

    it('PATCH rejects empty name', async () => {
      const created = await prisma.measurementUnit.create({
        data: { name: 'мм' },
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/measurement-units/${created.id}`)
        .send({ name: '' });
      expectError(response, 400);
    });

    it('POST rejects extra properties', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/measurement-units')
        .send({ ...validCreateMeasurementUnit, extra: true });
      expectError(response, 400);
    });

    it('GET rejects invalid id format', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/measurement-units/${INVALID_CUID}`,
      );
      expectError(response, 400, ErrorMessages.INVALID_MEASUREMENT_UNIT_ID);
    });

    it('GET rejects uppercase CUID', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/measurement-units/Caaaaaaaaaaaaaaaaaaaaaaa',
      );
      expectError(response, 400, ErrorMessages.INVALID_MEASUREMENT_UNIT_ID);
    });
  });

  describe('not found (404)', () => {
    it('GET returns 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer()).get(
        `/api/measurement-units/${NON_EXISTENT_CUID}`,
      );
      expectError(
        response,
        404,
        ErrorMessages.MEASUREMENT_UNIT_NOT_FOUND,
      );
    });

    it('PATCH returns 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/measurement-units/${NON_EXISTENT_CUID}`)
        .send({ name: 'новое' });
      expectError(
        response,
        404,
        ErrorMessages.MEASUREMENT_UNIT_NOT_FOUND,
      );
    });

    it('DELETE returns 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/api/measurement-units/${NON_EXISTENT_CUID}`,
      );
      expectError(
        response,
        404,
        ErrorMessages.MEASUREMENT_UNIT_NOT_FOUND,
      );
    });
  });

  describe('conflict (409)', () => {
    it('POST returns 409 for duplicate name', async () => {
      await request(app.getHttpServer())
        .post('/api/measurement-units')
        .send({ name: 'дубликат' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/measurement-units')
        .send({ name: 'дубликат' });
      expectError(
        response,
        409,
        ErrorMessages.MEASUREMENT_UNIT_NAME_EXISTS,
      );
    });

    it('PATCH returns 409 when renaming to existing name', async () => {
      await prisma.measurementUnit.createMany({
        data: [{ name: 'ед-A' }, { name: 'ед-B' }],
      });
      const units = await prisma.measurementUnit.findMany({
        orderBy: { name: 'asc' },
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/measurement-units/${units[1].id}`)
        .send({ name: 'ед-A' });
      expectError(
        response,
        409,
        ErrorMessages.MEASUREMENT_UNIT_NAME_EXISTS,
      );
    });
  });
});
