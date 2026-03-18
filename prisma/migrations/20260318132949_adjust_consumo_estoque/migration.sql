-- DropIndex
DROP INDEX "LoteEstoque_empresaId_idx";

-- CreateTable
CREATE TABLE "ConsumoEstoque" (
    "id" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "quantidade" DECIMAL(65,30) NOT NULL,
    "custoUnitario" DECIMAL(65,30) NOT NULL,
    "custoTotal" DECIMAL(65,30) NOT NULL,
    "referenciaId" TEXT,
    "referenciaTipo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsumoEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoteEstoque_empresaId_tenantId_idx" ON "LoteEstoque"("empresaId", "tenantId");

-- AddForeignKey
ALTER TABLE "ConsumoEstoque" ADD CONSTRAINT "ConsumoEstoque_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "LoteEstoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
