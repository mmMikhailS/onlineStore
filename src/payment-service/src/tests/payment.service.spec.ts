import { AppService } from '../app.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: {
            createOrder: jest.fn().mockResolvedValue([]), /// jest fn data
          },
        },
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should create order', async () => {
    expect(await service.createOrder().toEqual());
  });
});
