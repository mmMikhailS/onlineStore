export interface ProductInterface {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string;
  amount: string;
  quantity: number;
  type: string;
  Buffer: Buffer | null;
  orderId: number;
}
