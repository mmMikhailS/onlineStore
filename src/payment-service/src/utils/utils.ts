import { ShippingAddressDto } from '../dto/shippingAddress.Dto';
import { ProductDto } from '../dto/paymentProduct.dto';

export class Message {
  data: any;
  messageId: string;

  constructor(data: any, messageId: string) {
    (this.data = data), (this.messageId = messageId);
  }
}

export type actionDataType =
  | {
      product: ProductDto;
      userId: number;
    }
  | {
      shippingAddress: ShippingAddressDto;
      userId: number;
    }
  | number;

export type actionTopicType =
  | 'add-product'
  | 'create-order'
  | 'find-cart'
  | 'find-orders'
  | 'product-from-cart'
  | 'update-product-quantity';

type methodNameType = (topic: actionTopicType) => string;
export const methodName: methodNameType = (topic: actionTopicType): string => {
  const parts: string[] = topic.split('-');

  return parts
    .map((part: string, index: number): string =>
      index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join('');
};

export const topics: string[] = [
  'add-product',
  'create-order',
  'find-cart',
  'find-orders',
  'product-from-cart',
  'update-product-quantity',
];

export type OrderStatuses = 'CANCELLED' | 'CREATED' | 'PENDING' | 'DELIVERED';
