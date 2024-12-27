/*
  Warnings:

  - Added the required column `shopkeeper` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "shopkeeper" INTEGER NOT NULL;
