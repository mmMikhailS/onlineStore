export interface FindCartProductsInterface {
  cartItems: cartItems[];
}

interface cartItems {
  id: number;
  products: product;
  updatedAt: Date;
  quantity: number;
  cartId: number;
}

interface product {
  name: string;
  amount: string;
  inStock: number;
  description: string;
  type: string;
  image: Buffer;
}
