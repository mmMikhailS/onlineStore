/*
  Warnings:

  - You are about to drop the `_CartTocartItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CartTocartItems" DROP CONSTRAINT "_CartTocartItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_CartTocartItems" DROP CONSTRAINT "_CartTocartItems_B_fkey";

-- AlterTable
ALTER TABLE "cartItems" ADD COLUMN     "cartId" INTEGER;

-- DropTable
DROP TABLE "_CartTocartItems";

-- AddForeignKey
ALTER TABLE "cartItems" ADD CONSTRAINT "cartItems_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;
