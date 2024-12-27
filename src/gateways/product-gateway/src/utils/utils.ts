import { createProductDto } from '../dto/createProduct.dto';

export const promiseGetAllMessages = new Map();
export const promiseCreateProduct = new Map();
export const promiseCreateProductType = new Map();
export const promiseDeleteProduct = new Map();
export const promiseDeleteProductType = new Map();

export class Message {
  data: any;
  messageId: string;

  constructor(data: any, messageId: string) {
    (this.data = data), (this.messageId = messageId);
  }
}

export type actionTopicType =
  | 'get-all-products'
  | 'create-product'
  | 'create-product-type'
  | 'delete-product'
  | 'delete-product-type';

export const responseTopics: string[] = [
  'get-all-products-response',
  'create-product-response',
  'create-product-type-response',
  'delete-product-response',
  'delete-product-type-response',
];

export const actionPromise: {
  [key: string]: {
    get: (messageId: string) => any;
  };
} = {
  'get-all-products-response': {
    get: (messageId: string) => {
      return promiseGetAllMessages.get(messageId);
    },
  },
  'create-product-response': {
    get: (messageId: string) => {
      return promiseCreateProduct.get(messageId);
    },
  },
  'create-product-type-response': {
    get: (messageId: string) => {
      return promiseCreateProductType.get(messageId);
    },
  },
  'delete-product-response': {
    get: (messageId: string) => {
      return promiseDeleteProduct.get(messageId);
    },
  },
  'delete-product-type-response': {
    get: (messageId: string) => {
      return promiseDeleteProductType.get(messageId);
    },
  },
};

export type actionDataTypes =
  | {
      field: string;
      order: 'asc' | 'desc';
    }[]
  | {
      product: createProductDto;
      imageData: Express.Multer.File;
    }
  | string;
