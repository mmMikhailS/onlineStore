import { createProductDto } from '../dto/createProduct.dto';

export const topics: string[] = [
  'get-all-products',
  'create-product',
  'create-product-type',
  'delete-product',
  'delete-product-type',
];

export type actionTopicType =
  | 'get-all-products'
  | 'create-product'
  | 'create-product-type'
  | 'delete-product'
  | 'delete-product-type';

export class Message {
  data: any;
  messageId: string;

  constructor(data: any, messageId: string) {
    (this.data = data), (this.messageId = messageId);
  }
}

export type dataType =
  | string
  | {
      sort: [
        {
          field: string;
          order: 'asc' | 'desc';
        },
      ];
    }
  | {
      product: createProductDto;
      file: Express.Multer.File;
    };

export type handler = (data: dataType) => any;
