export interface CartProductsFindUniqueInterface {
  cartItems: {
    id: number;
    products: {
      name: string;
    };
  }[];
}
