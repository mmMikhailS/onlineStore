import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';

describe('PaymentController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new AuthMiddleware)
  });
});
