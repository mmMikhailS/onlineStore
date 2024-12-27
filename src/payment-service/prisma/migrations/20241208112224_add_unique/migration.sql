/*
  Warnings:

  - A unique constraint covering the columns `[productId]` on the table `cartItems` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cartId]` on the table `cartItems` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "cartItems_cartId_productId_key";

-- CreateIndex
CREATE UNIQUE INDEX "cartItems_productId_key" ON "cartItems"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "cartItems_cartId_key" ON "cartItems"("cartId");
