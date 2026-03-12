import { cicloRepository } from "../../repositories/ciclo/cicloRepository.js";
import { prisma } from "../../lib/prisma.js";

export const cicloService = {
  async iniciarPovoamento(
    data: {
      viveiroId: string;
      quantidadeLarvas: number;
      fornecedorLarvasId: string;
      dataInicio: Date;
    },
    user: { tenantId: string; empresaId: string }
  ) {
    const { tenantId, empresaId } = user;

    const viveiro = await prisma.viveiro.findFirst({
      where: {
        id: data.viveiroId,
        tenantId,
        empresaId,
        deletedAt: null,
      },
    });

    if (!viveiro) throw new Error("Viveiro não encontrado para esta empresa.");

    const cicloAtivo = await cicloRepository.findActiveByViveiroId(data.viveiroId, tenantId, empresaId);
    if (cicloAtivo) throw new Error("Este viveiro já possui um ciclo ativo.");

    return cicloRepository.createWithViveiroUpdate({
      ...data,
      status: "ATIVO",
      tenantId,
      empresaId,
    });
  },

  async listarTodosOsCiclos(user: { tenantId: string; empresaId: string }) {
    return cicloRepository.findAll(user.tenantId, user.empresaId);
  },

  async buscarCicloPorId(id: string, user: { tenantId: string; empresaId: string }) {
    const ciclo = await cicloRepository.findById(id, user.tenantId, user.empresaId);
    if (!ciclo) throw new Error("Ciclo não encontrado.");
    return ciclo;
  },

  async finalizarCiclo(id: string, user: { tenantId: string; empresaId: string }) {
    const ciclo = await cicloRepository.findById(id, user.tenantId, user.empresaId);
    if (!ciclo) throw new Error("Ciclo não encontrado.");
    if (ciclo.status === "FINALIZADO") throw new Error("Este ciclo já foi finalizado anteriormente.");

    return cicloRepository.finalizarCiclo(id, ciclo.viveiroId, new Date());
  },
};