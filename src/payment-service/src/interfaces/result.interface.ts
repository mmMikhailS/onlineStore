import { FindCartProductsInterface } from './prisma/findCartProduct.interface';
import { FindOrderInterface } from './prisma/findOrders.interface';
import { UpdateProductQuantityInterface } from './prisma/updateProductQuantity.interface';
import { PushedProductsInterface } from './pushedProducts.interface';

export type ResultInterface =
  | PushedProductsInterface
  | FindCartProductsInterface
  | FindOrderInterface[]
  | UpdateProductQuantityInterface
  | any;
