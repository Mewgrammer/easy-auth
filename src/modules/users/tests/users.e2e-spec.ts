import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from '../users.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, UsersModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should return status code 401 Unauthorized for GET: /api/users/:id without JWT', () => {
    return request(app.getHttpServer())
      .get('/api/users/0')
      .expect(401);
  });

  it('should return status code 401 Unauthorized for GET: /api/users without JWT', () => {
    return request(app.getHttpServer())
      .post('/api/users')
      .expect(401);
  });

  it('should return status code 401 Unauthorized for POST: /api/users without JWT', () => {
    return request(app.getHttpServer())
      .post('/api/users')
      .expect(401);
  });

  it('should return status code 401 Unauthorized for PUT: /api/users/:id without JWT', () => {
    return request(app.getHttpServer())
      .put('/api/users/0')
      .expect(401);
  });
});
