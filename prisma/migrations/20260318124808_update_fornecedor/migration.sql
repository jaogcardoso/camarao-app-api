/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Fornecedor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Fornecedor" ADD COLUMN     "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_email_key" ON "Fornecedor"("email");
