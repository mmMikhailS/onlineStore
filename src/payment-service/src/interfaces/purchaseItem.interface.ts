export interface PurchaseItemInterface {
  name: string;
  description: string;
  quantity: string;
  unit_amount: {
    currency_code: string;
    value: string;
  };
}

export interface ProductMapItem {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}
