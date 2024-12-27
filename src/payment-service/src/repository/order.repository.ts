import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ShippingAddressDto } from '../dto/shippingAddress.Dto';
import { OrderStatuses } from '../utils/utils';
import { CreateOrderInterface } from '../interfaces/prisma/createOrder.interface';
import { FindOrderInterface } from '../interfaces/prisma/findOrders.interface';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrders(userId: number): Promise<FindOrderInterface[]> {
    return this.prisma.order.findMany({
      where: {
        userId,
      },
    });
  }

  async createOrder(
    shippingAddress: ShippingAddressDto,
    status: OrderStatuses,
    userId: number,
  ): Promise<CreateOrderInterface> {
    const phoneNumber: string = `+${shippingAddress.phoneNumber.countryCode + shippingAddress.phoneNumber.nationalNumber}`;
    console.log(shippingAddress, status, userId);
    return this.prisma.order.create({
      data: {
        status,
        postalCode: shippingAddress.address.postalCode,
        city: shippingAddress.address.adminArea1,
        phoneNumber,
        user: {
          connect: { id: userId },
        },
      },
      select: {
        id: true,
        status: true,
      },
    });
  }
}
