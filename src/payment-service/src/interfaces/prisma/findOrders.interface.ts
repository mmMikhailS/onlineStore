export interface FindOrderInterface {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  postalCode: string | null;
  city: string | null;
  phoneNumber: string | null;
  userId: number | null;
}
