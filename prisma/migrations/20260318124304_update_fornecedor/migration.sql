/*
  Warnings:

  - A unique constraint covering the columns `[documento]` on the table `Fornecedor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Fornecedor" ADD COLUMN     "documento" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_documento_key" ON "Fornecedor"("documento");
