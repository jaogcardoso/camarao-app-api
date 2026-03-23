-- CreateTable
CREATE TABLE "Desbaste" (
    "id" TEXT NOT NULL,
    "cicloId" TEXT NOT NULL,
    "pesoTotalKg" DOUBLE PRECISION NOT NULL,
    "pesoMedioGramas" DOUBLE PRECISION NOT NULL,
    "quantidadeEstimado" INTEGER NOT NULL,
    "valorKg" DOUBLE PRECISION NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "observacao" TEXT,
    "tenantId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Desbaste_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Desbaste_cicloId_idx" ON "Desbaste"("cicloId");

-- CreateIndex
CREATE INDEX "Desbaste_tenantId_empresaId_idx" ON "Desbaste"("tenantId", "empresaId");

-- AddForeignKey
ALTER TABLE "Desbaste" ADD CONSTRAINT "Desbaste_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "Ciclo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
