import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ShippingAddressDto } from './dto/shippingAddress.Dto';
import { CartRepository } from './repository/cart.repository';
import { kafka } from './utils/kafka';
import { UserRepository } from './repository/user.repository';
import { ProductRepository } from './repository/product.repository';
import { OrderRepository } from './repository/order.repository';
import { FindCartItemQuantityInterface } from './interfaces/prisma/findCartItemQuantity.interface';
import { PurchaseItemInterface } from './interfaces/purchaseItem.interface';
import { FindProductsInterface } from './interfaces/prisma/findProducts.interface';
import { FindUserInterface } from './interfaces/prisma/findUser.interface';
import { FindCartIdInterface } from './interfaces/prisma/findCartId.interface';
import { CreateOrderInterface } from './interfaces/prisma/createOrder.interface';
import { FindCartProductsInterface } from './interfaces/prisma/findCartProduct.interface';
import { FindOrderInterface } from './interfaces/prisma/findOrders.interface';
import { UpdateProductQuantityDto } from './dto/updateProductQuantity.dto';
import { ProductFromCartInterface } from './interfaces/prisma/productFromCart.interface';
import { UpdateProductQuantityInterface } from './interfaces/prisma/updateProductQuantity.interface';
import { PushedProductsInterface } from './interfaces/pushedProducts.interface';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private readonly PAYPAL_API_BASE_URL: string =
    process.env.PAYPAL_API_BASE_URL || 'https://api-m.sandbox.paypal.com';
  private producer: any;

  constructor(
    private readonly cartRepository: CartRepository,
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserRepository,
    private readonly productRepository: ProductRepository,
  ) {
    this.producer = kafka.producer();
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
    console.log('producer connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
    console.log('producer disconnect');
  }

  async getAccessToken(): Promise<string> {
    const auth: string = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
    ).toString('base64');

    const response: Response = await fetch(
      `${this.PAYPAL_API_BASE_URL}/v1/oauth2/token`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          response_type: 'id_token',
          intent: 'sdk_init',
        }),
      },
    );

    if (!response.ok) {
      const errorText: string = await response.text();
      console.error('Failed to fetch access token:', errorText);
      throw new BadRequestException(
        `Failed to get access token: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.access_token;
  }

  async createOrder(data: {
    shippingAddress: ShippingAddressDto;
    userId: number;
  }) {
    const user: FindUserInterface = await this.userRepository.findUserById(
      data.userId,
    );
    if (!user) {
      throw new UnauthorizedException('user not registered');
    }
    const cart: FindCartIdInterface = await this.cartRepository.findCartId(
      data.userId,
    );
    if (!cart) {
      throw new UnauthorizedException('your order is empty');
    }
    const cartItems: FindProductsInterface[] =
      await this.cartRepository.findProducts(cart.id);

    if (!cartItems || !cartItems[0]) {
      throw new BadRequestException('Cart is empty');
    }

    const url = `${process.env.PAYPAL_API_BASE_URL}/v2/checkout/orders`;
    const accessToken: string = await this.getAccessToken();

    let totalValue: number = 0;
    for (const item of cartItems) {
      if (1 > item.products.inStock) {
        throw new BadRequestException(
          `The product with the name: ${item.products.name} is no longer in stock`,
        );
      }
      const findProduct: FindCartItemQuantityInterface =
        await this.cartRepository.findCartItemQuantity(item.products.name);

      totalValue += +item.products.amount * findProduct.quantity;
    }

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          items: await Promise.all(
            cartItems.map(
              async (
                item: FindProductsInterface,
              ): Promise<PurchaseItemInterface> => {
                const findProduct: FindCartItemQuantityInterface =
                  await this.cartRepository.findCartItemQuantity(
                    item.products.name,
                  );
                return {
                  name: item.products.name,
                  description: item.products.description,
                  quantity: `${findProduct.quantity}`,
                  unit_amount: {
                    currency_code: 'USD',
                    value: `${+item.products.amount}.00`, //  * item.quantity
                  },
                };
              },
            ),
          ),
          amount: {
            currency_code: 'USD',
            value: `${totalValue}`,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: `${totalValue}.00`,
              },
            },
          },
          shipping: {
            name: {
              full_name: user.fullName,
            },
            address: {
              address_line_1: data.shippingAddress?.address?.addressLine1,
              address_line_2: data.shippingAddress?.address?.addressLine2,
              admin_area_2: data.shippingAddress?.address?.adminArea2,
              admin_area_1: data.shippingAddress?.address?.adminArea1,
              postal_code: data.shippingAddress?.address?.postalCode,
              country_code: data.shippingAddress?.address?.countryCode,
            },
            phone_number: {
              country_code: data.shippingAddress?.phoneNumber?.countryCode,
              national_number:
                data.shippingAddress?.phoneNumber?.nationalNumber,
            },
          },
        },
      ],
    };

    console.log(payload);

    const response: Response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    console.log(response);

    if (!response.ok) {
      const errorText: string = await response.text();
      await this.orderRepository.createOrder(
        data.shippingAddress,
        'CANCELLED',
        data.userId,
      );
      throw new BadRequestException(`Failed to create order: ${errorText}`);
    }

    const createdOrder: CreateOrderInterface =
      await this.orderRepository.createOrder(
        data.shippingAddress,
        'CREATED',
        data.userId,
      );
    await this.producer
      .send({
        topic: 'order-mail',
        messages: [
          {
            value: JSON.stringify({
              to: user.email,
              id: createdOrder.id,
              status: createdOrder.status,
            }),
          },
        ],
      })
      .catch((e: any): never => {
        console.error(`payment gateway error: ` + e);
        throw e;
      });

    for (const orderProduct of cartItems) {
      await this.productRepository.inStockIncrement(orderProduct.products.name);
    }

    await this.cartRepository.updateCart(user.id);
    return response.json();
  }

  async addProduct(data: {
    productName: string;
    quantity: number;
    userId: number;
  }): Promise<PushedProductsInterface> {
    return this.cartRepository.pushProduct(
      data.productName,
      data.quantity,
      data.userId,
    );
  }

  async findCart(userId: number): Promise<FindCartProductsInterface> {
    return this.cartRepository.findCartProducts(userId);
  }

  async updateProductQuantity(
    data: UpdateProductQuantityDto,
  ): Promise<UpdateProductQuantityInterface> {
    return this.cartRepository.UpdateProductQuantity(
      data.productName,
      data.userId,
      data.quantity,
    );
  }

  async findOrders(userId: number): Promise<FindOrderInterface[]> {
    return this.orderRepository.findOrders(userId);
  }

  async productFromCart(data: any): Promise<ProductFromCartInterface> {
    return this.cartRepository.deleteProductById(data.productName, data.userId);
  }
}
