export interface FindProductsInterface {
  quantity: number;
  products: productInterface;
}

export interface productInterface {
  name: string;
  description: string;
  amount: string;
  inStock: number;
}
