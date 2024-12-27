export interface IsAlreadyProductInCartDto {
  productId: number;
  id: number;
  products: {
    name: string;
  };
}
