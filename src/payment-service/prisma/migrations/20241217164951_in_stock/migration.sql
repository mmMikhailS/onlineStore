/*
  Warnings:

  - You are about to drop the column `shopkeeper` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "shopkeeper",
ADD COLUMN     "inStock" INTEGER DEFAULT 1;
