import { prisma } from "../../lib/prisma.js";
import type { Ciclo } from "@prisma/client";

export const cicloRepository = {
  async findActiveByViveiroId(viveiroId: string, tenantId: string, empresaId: string): Promise<Ciclo | null> {
    return prisma.ciclo.findFirst({
      where: { viveiroId, tenantId, empresaId, status: "ATIVO", deletedAt: null },
    });
  },

  async createWithViveiroUpdate(data: any): Promise<Ciclo> {
    return prisma.$transaction(async (tx) => {
      const novoCiclo = await tx.ciclo.create({ data });
      await tx.viveiro.update({ where: { id: data.viveiroId }, data: { status: "EM_CULTIVO" } });
      return novoCiclo;
    });
  },

  async findAll(tenantId: string, empresaId: string): Promise<Ciclo[]> {
    return prisma.ciclo.findMany({
      where: { tenantId, empresaId },
      orderBy: { dataInicio: "desc" },
      include: { viveiro: true, registros: true },
    });
  },

  async findById(id: string, tenantId: string, empresaId: string): Promise<Ciclo | null> {
    return prisma.ciclo.findFirst({
      where: { id, tenantId, empresaId },
      include: { viveiro: true, registros: true },
    });
  },

  async finalizarCiclo(cicloId: string, viveiroId: string, dataFim: Date): Promise<Ciclo> {
    return prisma.$transaction(async (tx) => {
      const cicloFinalizado = await tx.ciclo.update({
        where: { id: cicloId },
        data: { status: "FINALIZADO", dataFim },
      });

      await tx.viveiro.update({ where: { id: viveiroId }, data: { status: "VAZIO" } });

      return cicloFinalizado;
    });
  },
};