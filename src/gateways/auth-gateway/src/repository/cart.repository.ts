import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaCartInterface } from '../interfaces/prisma/prismaCart.interface';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  createCart(userId: number): Promise<PrismaCartInterface> {
    return this.prisma.cart.create({
      data: {
        userId,
      },
      select: {
        userId: true,
      },
    });
  }

  async deleteCart(userId: number): Promise<void> {
    await this.prisma.cart.delete({
      where: {
        userId,
      },
    });
  }
}
