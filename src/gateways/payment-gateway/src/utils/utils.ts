import { PaymentProductsDto } from '../dto/response/paymentProducts.dto';
import { UpdateProductQuantityInterface } from '../interfaces/updateProductQuantity.interface';

export const responseTopics: string[] = [
  'create-order-response',
  'add-product-response',
  'find-cart-response',
  'find-orders-response',
  'product-from-cart-response',
  'update-product-quantity-response',
];

export const createOrderPromise = new Map();
export const addProductPromise = new Map();
export const findOrdersPromise = new Map();
export const findCartPromise = new Map();
export const removeProductFromCartPromise = new Map();
export const updateProductQuantityPromise = new Map();

export const actionPromise: {
  [key: string]: {
    get: (id: string) => any;
  };
} = {
  'create-order-response': {
    get: (id: string) => {
      return createOrderPromise.get(id);
    },
  },
  'add-product-response': {
    get: (id: string) => {
      return addProductPromise.get(id);
    },
  },
  'find-cart-response': {
    get: (id: string) => {
      return findCartPromise.get(id);
    },
  },
  'find-orders-response': {
    get: (id: string) => {
      return findOrdersPromise.get(id);
    },
  },
  'product-from-cart-response': {
    get: (id: string) => {
      return removeProductFromCartPromise.get(id);
    },
  },
  'update-product-quantity-response': {
    get: (id: string) => {
      return updateProductQuantityPromise.get(id);
    },
  },
};

export class Message {
  data: any;
  messageId: string;

  constructor(data: any, messageId: string) {
    (this.data = data), (this.messageId = messageId);
  }
}

export type actionTopicType =
  | 'create-order'
  | 'add-product'
  | 'find-cart'
  | 'find-orders'
  | 'product-from-cart'
  | 'update-product-quantity';

export type actionDataType =
  | PaymentProductsDto
  | {
      productName: string;
      userId: number;
    }
  | number
  | UpdateProductQuantityInterface;

export type resolveType = (value: actionDataType) => void;
export type rejectType = (reason?: any) => void;

export type mapPromiseType<T> = Map<
  string,
  {
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
  }
>;
