/*
  Warnings:

  - You are about to drop the column `cartId` on the `cartItems` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "cartItems" DROP CONSTRAINT "cartItems_cartId_fkey";

-- AlterTable
ALTER TABLE "cartItems" DROP COLUMN "cartId";

-- CreateTable
CREATE TABLE "_CartTocartItems" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CartTocartItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CartTocartItems_B_index" ON "_CartTocartItems"("B");

-- AddForeignKey
ALTER TABLE "_CartTocartItems" ADD CONSTRAINT "_CartTocartItems_A_fkey" FOREIGN KEY ("A") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartTocartItems" ADD CONSTRAINT "_CartTocartItems_B_fkey" FOREIGN KEY ("B") REFERENCES "cartItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
