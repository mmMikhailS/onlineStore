import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentModule } from '../payment.module';
import * as request from 'supertest';

describe('PaymentController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PaymentModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/createOrder (POST)', async () => {
    return request(
      await app
        .getHttpServer()
        .post('/payment/createOrder')
        .send({
          shippingAddress: {
            name: {
              fullName: 'John Doe',
            },
            address: {
              addressLine1: '123 Main St',
              addressLine2: 'Apt 4B',
              adminArea1: 'Kyiv',
              adminArea2: 'Kyiv City',
              postalCode: '01001',
              countryCode: 'UA',
            },
            phoneNumber: {
              countryCode: '380',
              nationalNumber: '501234567',
            },
          },
          products: [
            {
              name: 'Laptop',
              description: 'A high-end gaming laptop',
              quantity: '1',
              unit_amount: {
                currency_code: 'USD',
                value: '1500',
              },
            },
            {
              name: 'Mouse',
              description: 'Wireless mouse',
              quantity: '2',
              unit_amount: {
                currency_code: 'USD',
                value: '50',
              },
            },
          ],
        })
        .expect(201)
        .expect({
          createdOrder: {
            id: '2SC77513T11397127',
            status: 'CREATED',
            links: [
              {
                href: 'https://api.sandbox.paypal.com/v2/checkout/orders/2SC77513T11397127',
                rel: 'self',
                method: 'GET',
              },
              {
                href: 'https://www.sandbox.paypal.com/checkoutnow?token=2SC77513T11397127',
                rel: 'approve',
                method: 'GET',
              },
              {
                href: 'https://api.sandbox.paypal.com/v2/checkout/orders/2SC77513T11397127',
                rel: 'update',
                method: 'PATCH',
              },
              {
                href: 'https://api.sandbox.paypal.com/v2/checkout/orders/2SC77513T11397127/capture',
                rel: 'capture',
                method: 'POST',
              },
            ],
          },
        }),
    );
  });
});
