import { prisma } from "../../lib/prisma.js";
import { getContext } from "../../context/requestContext.js";
import type { Ciclo } from "@prisma/client";

export const cicloRepository = {

  async findActiveByViveiroId(viveiroId: string): Promise<Ciclo | null> {

    const { tenantId, empresaId } = getContext();

    return prisma.ciclo.findFirst({
      where: {
        viveiroId,
        tenantId: tenantId!,
        empresaId: empresaId!,
        status: "ATIVO",
        deletedAt: null
      }
    });

  },

  async createWithViveiroUpdate(data: any): Promise<Ciclo> {

    const { tenantId, empresaId } = getContext();

    return prisma.$transaction(async (tx) => {

      const novoCiclo = await tx.ciclo.create({
        data: {
          ...data,
          tenantId,
          empresaId
        }
      });

      await tx.viveiro.update({
        where: { id: data.viveiroId },
        data: { status: "EM_CULTIVO" }
      });

      return novoCiclo;

    });
  }

};