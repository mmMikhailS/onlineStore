/*
  Warnings:

  - You are about to drop the column `Buffer` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartId]` on the table `cartItems` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Product_orderId_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "Buffer",
ADD COLUMN     "image" BYTEA;

-- CreateIndex
CREATE UNIQUE INDEX "cartItems_cartId_key" ON "cartItems"("cartId");
