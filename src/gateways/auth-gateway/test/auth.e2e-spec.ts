import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../src/auth.module';
import * as request from 'supertest';
import { AuthGatewayService } from '../src/auth.service';
import { AuthController } from '../src/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        JwtModule.register({
          secret: process.env.SECRET_KEY,
        }),
      ],
      controllers: [AuthController],
      providers: [AuthGatewayService],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('(POST) - Register a new user', async () => {
    const response: any = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'VVV',
        email: `test${uuidv4()}6@gmail.com`,
        password: '12345678',
        acceptPassword: '12345678',
      });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(Number),
      isActivated: false,
      activationLink: expect.any(String),
      tokens: {
        refreshToken: expect.any(String),
        accessToken: expect.any(String),
      },
    });
  });

  it('(POST) - Login user', async () => {
    const response: any = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: '1@gmail.com',
        password: '12345678',
      });
    expect(response.status).toBe(201);
    expect(response.headers['authorization']).toEqual(
      `Bearer ${expect.any(String)}`,
    );
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('refreshToken=')]),
    );
    expect(response.body).toEqual({
      id: expect.any(Number),
      isActivated: false,
      activationLink: expect.any(String),
      tokens: {
        refreshToken: expect.any(String),
        accessToken: expect.any(String),
      },
    });
  });
});
