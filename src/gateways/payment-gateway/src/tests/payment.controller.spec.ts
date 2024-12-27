import { PaymentController } from '../payment.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../payment.service';
import { JwtService } from '@nestjs/jwt';

describe('create order', (): void => {
  let controller: PaymentController;
  let service: PaymentService;
  let res;
  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        JwtService,
        {
          provide: PaymentService,
          useValue: {
            payment: {
              createOrder: jest.fn(),
            },
          },
        },
      ],
    }).compile();
    controller = module.get<PaymentController>(PaymentController);
    service = module.get<PaymentService>(PaymentService);
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return order', async (): Promise<void> => {
    const reqData = {
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
    };
    service.promiseSendMessage = jest.fn().mockResolvedValue({
      id: expect.any(String),
      status: 'CREATED',
      links: [
        {
          href: `https://api.sandbox.paypal.com/v2/checkout/orders/${expect.any(String)}`,
          rel: 'self',
          method: 'GET',
        },
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=${expect.any(String)}`,
          rel: 'approve',
          method: 'GET',
        },
        {
          href: `https://api.sandbox.paypal.com/v2/checkout/orders/${expect.any(String)}`,
          rel: 'update',
          method: 'PATCH',
        },
        {
          href: `https://api.sandbox.paypal.com/v2/checkout/orders/${expect.any(String)}/capture`,
          rel: 'capture',
          method: 'POST',
        },
      ],
    });

    await controller.createOrder(reqData, res);
    expect(service.promiseSendMessage).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      createdOrder: {
        id: expect.any(String),
        status: 'CREATED',
        links: [
          {
            href: `https://api.sandbox.paypal.com/v2/checkout/orders/${expect.any(String)}`,
            rel: 'self',
            method: 'GET',
          },
          {
            href: `https://www.sandbox.paypal.com/checkoutnow?token=${expect.any(String)}`,
            rel: 'approve',
            method: 'GET',
          },
          {
            href: `https://api.sandbox.paypal.com/v2/checkout/orders/${expect.any(String)}`,
            rel: 'update',
            method: 'PATCH',
          },
          {
            href: `https://api.sandbox.paypal.com/v2/checkout/orders/${expect.any(String)}/capture`,
            rel: 'capture',
            method: 'POST',
          },
        ],
      },
    });
  });
});
