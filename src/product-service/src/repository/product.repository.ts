import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetAllProductsResponseDto } from '../dto/prisma/getAllProducts.response.dto';
import { DeleteProductInterface } from '../interfaces/prisma/deleteByName.interface';
import { SortOptionsMapItemInterface } from '../interfaces/prisma/sortOptionsMapItem.interface';
import { SortOptionsInterface } from '../interfaces/prisma/sortOptions.interface';
import { ProductItemInterface } from '../interfaces/prisma/productItem.interface';
import { GetAllProductsDto } from '../dto/getAllProducts.dto';
import { createProductDto } from '../dto/createProduct.dto';
import { CreateProductInterface } from '../interfaces/prisma/createProduct.interface';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllProducts(
    sort: GetAllProductsDto[],
  ): Promise<GetAllProductsResponseDto> {
    try {
      const sortOptions: SortOptionsInterface[] = sort.map(
        (item: SortOptionsMapItemInterface): SortOptionsInterface => ({
          [item.field]: item.order,
        }),
      );
      const productsArray: ProductItemInterface[] =
        await this.prisma.product.findMany({
          orderBy: [...sortOptions],
          select: {
            id: true,
            createdAt: true,
            name: true,
            type: true,
            description: true,
            inStock: true,
            amount: true,
            image: true,
          },
        });
      return {
        products: productsArray.map(
          (array: ProductItemInterface): ProductItemInterface => ({
            ...array,
          }),
        ),
      };
    } catch (e) {
      console.error('Error fetching products: ', e);
      throw e;
    }
  }

  async createProduct(
    dto: createProductDto,
    imageBuffer: Buffer,
  ): Promise<CreateProductInterface> {
    try {
      return await this.prisma.product.create({
        data: {
          ...dto,
          image: imageBuffer,
        },
        select: {
          name: true,
          description: true,
          type: true,
          amount: true,
          createdAt: true,
        },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new BadRequestException('Product with that name already exists');
      }
      throw e;
    }
  }

  async deleteProduct(name: string): Promise<DeleteProductInterface> {
    try {
      return await this.prisma.product.delete({
        where: {
          name,
        },
        select: {
          name: true,
          description: true,
          amount: true,
          type: true,
          createdAt: true,
        },
      });
    } catch (e) {
      if (e.code === 'P2025') {
        throw new BadRequestException('No product with this name');
      }
      console.error('Error fetching products: ', e);
      throw e;
    }
  }
}
