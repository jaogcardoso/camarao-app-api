import { prisma } from "../../lib/prisma.js";

export const DesbasteService = {
  async criar(data: {
    cicloId: string;
    pesoTotalKg: number;
    pesoMedioGramas: number;
    valorKg: number;
    observacao?: string;
    tenantId: string;
    empresaId: string;
  }) {
    const {
      cicloId,
      pesoTotalKg,
      pesoMedioGramas,
      valorKg,
      observacao,
      tenantId,
      empresaId,
    } = data;

    if (pesoTotalKg <= 0) throw new Error("Peso deve ser maior que zero");
    if (pesoMedioGramas <= 0) throw new Error("Peso médio inválido");

    const quantidadeEstimado = Math.round(
      (pesoTotalKg * 1000) / pesoMedioGramas
    );

    const valorTotal = pesoTotalKg * valorKg;

    return prisma.desbaste.create({
      data: {
        cicloId,
        pesoTotalKg,
        pesoMedioGramas,
        quantidadeEstimado,
        valorKg,
        valorTotal,
        observacao: observacao ?? null,
        tenantId,
        empresaId,
      },
    });
  },
};