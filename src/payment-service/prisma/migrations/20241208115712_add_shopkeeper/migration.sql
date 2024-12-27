/*
  Warnings:

  - The `quantity` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "quantity",
ADD COLUMN     "quantity" INTEGER DEFAULT 1,
ALTER COLUMN "shopkeeper" DROP NOT NULL,
ALTER COLUMN "shopkeeper" SET DEFAULT 0;
