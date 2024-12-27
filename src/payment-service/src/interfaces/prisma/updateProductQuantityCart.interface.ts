export interface UpdateProductQuantityCartInterface {
  id: number;
  cartItems: {
    id: number;
    products: {
      name: string;
    };
  }[];
}
