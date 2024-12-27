export type ResultType =
  | FindCartProductsInterface
  | FindOrderInterface[]
  | PushedProductsType;

export interface FindOrderInterface {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  status: createOrder;
  postalCode: string | null;
  city: string | null;
  phoneNumber: string | null;
  userId: number | null;
}

type createOrder = 'CANCELLED' | 'CREATED' | 'PENDING' | 'DELIVERED';

export interface FindCartProductsInterface {
  cartItems: cartItems[];
}

interface cartItems {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  quantity: number;
  productId: number | null;
  cartId: number | null;
}

interface CartItem {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  quantity: number;
  productId: number | null;
  cartId: number | null;
}

interface PushedProductsWithCartItems {
  id: number;
  cartItems: CartItem[];
}

interface PushedProductsBasic {
  quantity: number;
  productId: number;
  cartId: number;
}

export type PushedProductsType =
  | PushedProductsWithCartItems
  | PushedProductsBasic;
