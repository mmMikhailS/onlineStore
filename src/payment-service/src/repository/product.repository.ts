import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  findProduct(name: string) {
    return this.prisma.product.findUnique({
      where: { name },
      select: {
        name: true,
      },
    });
  }

  async inStockIncrement(name: string): Promise<void> {
    await this.prisma.product.update({
      where: { name },
      data: {
        inStock: { decrement: 1 },
      },
    });
  }
}
