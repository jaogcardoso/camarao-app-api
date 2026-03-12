import { cicloRepository } from "../../repositories/ciclo/cicloRepository.js";
import { prisma } from "../../lib/prisma.js";
import { getContext } from "../../context/requestContext.js";

export const cicloService = {
  async iniciarPovoamento(data: {
    viveiroId: string
    quantidadeLarvas: number
    fornecedorLarvasId: string
    dataInicio: Date
  }) {

    const { tenantId, empresaId } = getContext();

    // valida se o viveiro pertence ao tenant/empresa
    const viveiro = await prisma.viveiro.findFirst({
      where: {
        id: data.viveiroId,
        tenantId: tenantId!,
        empresaId: empresaId!,
        deletedAt: null
      }
    });

    if (!viveiro) {
      throw new Error("Viveiro não encontrado para esta empresa.");
    }

    // verifica ciclo ativo
    const cicloAtivo = await cicloRepository.findActiveByViveiroId(data.viveiroId);

    if (cicloAtivo) {
      throw new Error("Este viveiro já possui um ciclo ativo.");
    }

    return cicloRepository.createWithViveiroUpdate({
      ...data,
      status: "ATIVO"
    });
  },
  async listarTodosOsCiclos() {
    return cicloRepository.findAll();
  },

   async buscarCicloPorId(id: string) {
    const ciclo = await cicloRepository.findById(id);
    
    if (!ciclo) {
      throw new Error('Ciclo não encontrado.');
    }

    return ciclo;
  },

  async finalizarCiclo(cicloId: string) {
    // 1. Verifica se o ciclo existe e está ativo
    const ciclo = await cicloRepository.findById(cicloId);
    
    if (!ciclo) {
      throw new Error('Ciclo não encontrado.');
    }

    if (ciclo.status === 'FINALIZADO') {
      throw new Error('Este ciclo já foi finalizado anteriormente.');
    }

    // 2. Executa a finalização (Transação)
    return cicloRepository.finalizarCicro(cicloId, ciclo.viveiroId, new Date());
  }
};