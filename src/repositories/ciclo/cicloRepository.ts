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
  },

  async findAllByViveiroId(viveiroId: string): Promise<Ciclo[]> {
    return prisma.ciclo.findMany({
      where: { viveiroId },
      orderBy: { dataInicio: 'desc' },
      include: { registros: true } // Traz os registros diários junto
    });
  },

  async findAll(): Promise<Ciclo[]> {
    return prisma.ciclo.findMany({
      orderBy: { dataInicio: 'desc' },
      include: { 
        viveiro: true // Traz os dados do viveiro (nome, tamanho, etc)
      }
    });
  },

  // Busca um ciclo específico por ID
  async findById(id: string): Promise<Ciclo | null> {
    return prisma.ciclo.findUnique({
      where: { id },
      include: { viveiro: true, registros: true }
    });
  },

  // FINALIZAÇÃO: Encerra o ciclo e libera o viveiro ao mesmo tempo
  async finalizarCicro(cicloId: string, viveiroId: string, dataFim: Date): Promise<Ciclo> {
    return prisma.$transaction(async (tx) => {
      // 1. Atualiza o Ciclo para 'FINALIZADO' e define a data de fim
      const cicloFinalizado = await tx.ciclo.update({
        where: { id: cicloId },
        data: { 
          status: 'FINALIZADO',
          dataFim: dataFim
        }
      });

      // 2. Volta o status do Viveiro para 'VAZIO'
      await tx.viveiro.update({
        where: { id: viveiroId },
        data: { status: 'VAZIO' }
      });

      return cicloFinalizado;
    });
  }
};
