import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductRepository } from './repository/product.repository';
import { CreateProductInterface } from './interfaces/prisma/createProduct.interface';
import { createProductDto } from './dto/createProduct.dto';

@Injectable()
export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  async createProduct(data: {
    product: createProductDto;
    imageData: Express.Multer.File;
  }): Promise<CreateProductInterface> {
    try {
      const imageBuffer: Buffer = Buffer.from(data.imageData.buffer);
      if (!Buffer.isBuffer(imageBuffer)) {
        throw new BadRequestException('imageBuffer is not a valid Buffer');
      }

      return this.productRepository.createProduct(data.product, imageBuffer);
    } catch (e) {
      throw e;
    }
  }
}
