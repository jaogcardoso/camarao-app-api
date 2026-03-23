import { cicloRepository } from "../../repositories/ciclo/cicloRepository.js";
import { prisma } from "../../lib/prisma.js";
import { consumoService } from "../consumo/consumoServices.js";

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

  async registrarConsumo(data: {
  cicloId: string;
  produtoId: string;
  quantidade: number;
  tenantId: string;
  empresaId: string;
}) {
  const ciclo = await cicloRepository.findById( data.cicloId,
  data.tenantId,
  data.empresaId);

  if (!ciclo) {
    throw new Error('Ciclo não encontrado');
  }

  if (ciclo.status !== 'ATIVO') {
    throw new Error('Ciclo não está ativo');
  }

  const consumo = await consumoService.consumirEstoque({
    produtoId: data.produtoId,
    quantidade: data.quantidade,
    referenciaId: data.cicloId,
    referenciaTipo: 'CICLO'
  });

  return consumo;
},
async registrarDesbaste(data: any) {
  const ciclo = await cicloRepository.findById(
    data.cicloId,
    data.tenantId,
    data.empresaId
  );

  if (!ciclo) {
    throw new Error("Ciclo não encontrado");
  }

  if (ciclo.status !== "ATIVO") {
    throw new Error("Ciclo não está ativo");
  }

  if (Number(data.pesoTotalKg) <= 0) {
    throw new Error("Peso total deve ser maior que zero");
  }

  if (Number(data.pesoMedioGramas) <= 0) {
    throw new Error("Peso médio inválido");
  }

  const quantidadeEstimado = Math.round(
    (Number(data.pesoTotalKg) * 1000) / Number(data.pesoMedioGramas)
  );

  const valorTotal =
    Number(data.pesoTotalKg) * Number(data.valorKg);

  return prisma.desbaste.create({
    data: {
      cicloId: data.cicloId,
      pesoTotalKg: Number(data.pesoTotalKg),
      pesoMedioGramas: Number(data.pesoMedioGramas),
      quantidadeEstimado,
      valorKg: Number(data.valorKg),
      valorTotal,
      observacao: data.observacao,
      tenantId: data.tenantId,
      empresaId: data.empresaId,
    },
  });
},

async listarDesbastes(cicloId: string) {
  return prisma.desbaste.findMany({
    where: { cicloId },
    orderBy: { createdAt: 'desc' }
  });
},

async getResumoCiclo(
  cicloId: string,
  user: { tenantId: string; empresaId: string }
) {
  const ciclo = await cicloRepository.findById(
    cicloId,
    user.tenantId,
    user.empresaId
  );

  if (!ciclo) throw new Error("Ciclo não encontrado");

  const desbastes = await prisma.desbaste.aggregate({
    where: {
      cicloId,
      tenantId: user.tenantId,
      empresaId: user.empresaId,
    },
    _sum: {
      pesoTotalKg: true,
      quantidadeEstimado: true,
      valorTotal: true,
    },
  });

  return {
    populacaoInicial: ciclo.quantidadeLarvas,
    totalDesbasteKg: desbastes._sum.pesoTotalKg || 0,
    totalDesbasteQtd: desbastes._sum.quantidadeEstimado || 0,
    receitaDesbaste: desbastes._sum.valorTotal || 0,
  };
}
};