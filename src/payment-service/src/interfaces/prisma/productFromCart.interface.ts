export interface ProductFromCartInterface {
  id: number;
  name: string;
}

export interface ResultRemoveInterface {
  id: number;
  cartId: number;
  productId: number;
  products: {
    name: string;
  };
}
