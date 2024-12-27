export interface ProductItemInterface {
  id: number;
  createdAt: Date;
  name: string;
  type: string;
  description: string;
  inStock: number;
  amount: string;
  image: Buffer;
}
