export interface ProductsCartInterface {
  id: number;
  cartItems: {
    id: number;
    products: {
      name: string;
    };
    productId: number;
  }[];
}
