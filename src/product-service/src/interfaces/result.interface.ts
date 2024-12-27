import { GetAllProductsResponseDto } from '../dto/prisma/getAllProducts.response.dto';
import { CreateProductInterface } from './prisma/createProduct.interface';
import { DeleteProductInterface } from './prisma/deleteByName.interface';

export type ResultInterface =
  | DeleteProductInterface
  | CreateProductInterface
  | GetAllProductsResponseDto;
