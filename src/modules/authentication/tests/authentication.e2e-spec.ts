import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthenticationModule } from '../authentication.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';

describe('AuthenticationController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, AuthenticationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should return status code 401 Unauthorized on GET /auth without JWT', () => {
    return request(app.getHttpServer())
      .get('/auth')
      .expect(401);
  });
});
