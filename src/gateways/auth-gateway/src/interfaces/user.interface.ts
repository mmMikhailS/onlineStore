export interface User {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  updatedPasswordAt: Date;
  fullName?: string;
  isAdmin: boolean;
}
