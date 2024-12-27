/*
  Warnings:

  - You are about to drop the column `Buffer` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `shopkeeper` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "Buffer",
DROP COLUMN "shopkeeper",
ADD COLUMN     "image" BYTEA,
ALTER COLUMN "quantity" SET DEFAULT '1',
ALTER COLUMN "quantity" SET DATA TYPE TEXT;
