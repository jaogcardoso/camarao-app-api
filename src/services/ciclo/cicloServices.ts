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
      custoLarvas?: number;
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

  const produto = await prisma.produto.findUnique({
  where: { id: data.produtoId },
  select: { nome: true, unidadeMedida: true, tipo: true },
});

await prisma.registroDiario.create({
  data: {
    cicloId: data.cicloId,
    tipo: produto?.tipo === "INSUMO" ? "USO_INSUMO" : "ALIMENTACAO",
    detalhes: {
      descricao: `${produto?.nome ?? 'Produto'}: ${data.quantidade} ${produto?.unidadeMedida ?? ''}`,
      quantidade: data.quantidade,
      unidade: produto?.unidadeMedida ?? '',
      produtoId: data.produtoId,
    },
  },
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
},
async resumoCiclo(cicloId: string) {
  const ciclo = await prisma.ciclo.findUnique({
    where: { id: cicloId }
  });

  if (!ciclo) {
    throw new Error("Ciclo não encontrado");
  }

  const desbastes = await prisma.desbaste.findMany({
    where: { cicloId }
  });

  const totalDesbasteKg = desbastes.reduce(
    (acc, d) => acc + Number(d.pesoTotalKg), 0
  );

  const totalDesbasteQtd = desbastes.reduce(
    (acc, d) => acc + d.quantidadeEstimado, 0
  );

  const receitaDesbaste = desbastes.reduce(
    (acc, d) => acc + Number(d.valorTotal), 0
  );

  const consumos = await prisma.consumoEstoque.findMany({
    where: {
      referenciaId: cicloId,
      referenciaTipo: "CICLO"
    },
    include: {
      lote: {
        include: {
          produto: {
            select: { tipo: true, unidadeMedida: true }
          }
        }
      }
    }
  });

  const consumosRacao = consumos.filter(c => c.lote.produto.tipo === 'RACAO');
  const consumosInsumo = consumos.filter(c => c.lote.produto.tipo === 'INSUMO');

  const custoRacao = consumosRacao.reduce(
    (acc, c) => acc + Number(c.custoTotal), 0
  );
  const custoInsumos = consumosInsumo.reduce(
    (acc, c) => acc + Number(c.custoTotal), 0
  );

  const totalRacaoKg = consumosRacao.reduce(
    (acc, c) => acc + Number(c.quantidade), 0
  );

  const totalInsumosKg = consumosInsumo.reduce((acc, c) => {
    const qtd = Number(c.quantidade);
    const unidade = c.lote.produto.unidadeMedida?.toLowerCase() ?? 'kg';
    if (unidade === 'g') return acc + qtd / 1000;
    if (unidade === 'mg') return acc + qtd / 1000000;
    if (unidade === 'l') return acc + qtd;
    if (unidade === 'ml') return acc + qtd / 1000;
    if (unidade === 't') return acc + qtd * 1000;
    return acc + qtd;
  }, 0);

  // ── Peso médio — mais recente entre biometria e desbaste ──
  const ultimoDesbaste = desbastes[desbastes.length - 1];

  const ultimaBiometria = await prisma.registroDiario.findFirst({
    where: { cicloId, tipo: 'BIOMETRIA' },
    orderBy: { createdAt: 'desc' },
  });

  const pesoMedioBiometria = ultimaBiometria
    ? Number((ultimaBiometria.detalhes as Record<string, any>).pesoMedioGramas ?? 0)
    : 0;

  const pesoMedioDesbaste = ultimoDesbaste
    ? Number(ultimoDesbaste.pesoMedioGramas)
    : 0;

  const dataDesbaste = ultimoDesbaste ? new Date(ultimoDesbaste.createdAt).getTime() : 0;
  const dataBiometria = ultimaBiometria ? new Date(ultimaBiometria.createdAt).getTime() : 0;

  const pesoMedioAtual = dataBiometria >= dataDesbaste
    ? pesoMedioBiometria
    : pesoMedioDesbaste;

  // ── Dias do ciclo ──
  const dataInicio = new Date(ciclo.dataInicio).getTime();
  const dataFim = ciclo.dataFim ? new Date(ciclo.dataFim).getTime() : Date.now();
  const diasDoCiclo = Math.max(1, Math.floor((dataFim - dataInicio) / (1000 * 60 * 60 * 24)));

  // ── Biomassa estimada pelo consumo de ração (3% do peso corporal/dia) ──
  const TAXA_ALIMENTACAO = 0.03;
  const biomassaEstimadaRacao = totalRacaoKg > 0 && diasDoCiclo > 0
    ? totalRacaoKg / diasDoCiclo / TAXA_ALIMENTACAO
    : 0;

  // Usa biomassa por ração se tiver dados de ração e biometria
  // Caso contrário usa populacaoInicial * pesoMedio como fallback
  const biomassa = biomassaEstimadaRacao > 0 && pesoMedioAtual > 0
    ? biomassaEstimadaRacao
    : (ciclo.quantidadeLarvas * pesoMedioAtual) / 1000;

  // ── Animais vivos estimados ──
  const animaisVivos = pesoMedioAtual > 0 && biomassa > 0
    ? Math.round((biomassa * 1000) / pesoMedioAtual)
    : ciclo.quantidadeLarvas - totalDesbasteQtd;

  // ── Sobrevivência ──
  const sobrevivencia = ciclo.quantidadeLarvas > 0
    ? Math.min(1, animaisVivos / ciclo.quantidadeLarvas)
    : 0;

  // ── Financeiro ──
  const producaoKg = totalDesbasteKg;
  const custoLarvas = Number(ciclo.custoLarvas ?? 0);
  const custoTotal = custoRacao + custoInsumos + custoLarvas;
  const lucroParcial = receitaDesbaste - custoTotal;

  const custoPorKg = producaoKg > 0 ? custoTotal / producaoKg : 0;
  const precoMedioKg = producaoKg > 0 ? receitaDesbaste / producaoKg : 0;
  const fcr = producaoKg > 0 ? totalRacaoKg / producaoKg : 0;

  const margem = receitaDesbaste > 0
    ? (lucroParcial / receitaDesbaste) * 100
    : 0;

  // ── Lucro projetado usando biomassa estimada ──
  const lucroProjetado = biomassa > 0 && precoMedioKg > 0
    ? biomassa * (precoMedioKg - custoPorKg)
    : 0;

  return {
    cicloId,
    populacaoInicial: ciclo.quantidadeLarvas,

    totalDesbasteKg,
    totalDesbasteQtd,
    receitaDesbaste,

    custoLarvas,
    custoRacao,
    custoInsumos,
    custoTotal,
    totalRacaoKg,
    totalInsumosKg,
    lucroParcial,

    fcr,
    diasDoCiclo,
    biomassaEstimadaRacao,

    sobrevivencia,
    animaisVivos,
    pesoMedioAtual,
    biomassa,

    custoPorKg,
    precoMedioKg,
    lucroProjetado,
    margem,
  };
},
async listarEventos(
  cicloId: string,
  user: { tenantId: string; empresaId: string }
) {
  // Verifica se o ciclo pertence à empresa do usuário
  const ciclo = await cicloRepository.findById(cicloId, user.tenantId, user.empresaId);
  if (!ciclo) throw new Error("Ciclo não encontrado");

  // Busca todos os registros do diário ordenados do mais antigo para o mais recente
  const registros = await prisma.registroDiario.findMany({
    where: { cicloId },
    orderBy: { createdAt: 'asc' },
  });

  // Formata para o frontend entender — transforma o Json "detalhes" em campos planos
  return registros.map((r) => {
    const detalhes = r.detalhes as Record<string, any>;
    return {
      id: r.id,
      tipo: r.tipo,
      descricao: detalhes.descricao ?? r.tipo,
      quantidade: detalhes.quantidade ?? null,
      unidade: detalhes.unidade ?? null,
      createdAt: r.createdAt,
    };
  });
},

async registrarBiometria(
  cicloId: string,
  data: { pesoMedioGramas: number },
  user: { tenantId: string; empresaId: string }
) {
  const ciclo = await cicloRepository.findById(cicloId, user.tenantId, user.empresaId);
  if (!ciclo) throw new Error("Ciclo não encontrado");
  if (ciclo.status !== 'ATIVO') throw new Error("Ciclo não está ativo");

  // Cria o RegistroDiario com tipo BIOMETRIA
  // "detalhes" é um Json livre — guardamos o que o frontend vai precisar exibir
  return prisma.registroDiario.create({
    data: {
      cicloId,
      tipo: 'BIOMETRIA',
      detalhes: {
        pesoMedioGramas: data.pesoMedioGramas,
        descricao: `Biometria: ${data.pesoMedioGramas}g de peso médio`,
        quantidade: data.pesoMedioGramas,
        unidade: 'g',
      },
    },
  });
},

async registrarDespesca(
  cicloId: string,
  data: {
    pesoTotalKg: number;
    pesoMedioGramas: number;
    valorKg: number;
    observacao?: string;
  },
  user: { tenantId: string; empresaId: string }
) {
  const ciclo = await cicloRepository.findById(cicloId, user.tenantId, user.empresaId);
  if (!ciclo) throw new Error("Ciclo não encontrado");
  if (ciclo.status !== 'ATIVO') throw new Error("Ciclo não está ativo");

  const quantidadeEstimado = Math.round(
    (data.pesoTotalKg * 1000) / data.pesoMedioGramas
  );
  const valorTotal = data.pesoTotalKg * data.valorKg;

  // Cria o Desbaste
  const desbaste = await prisma.desbaste.create({
    data: {
      cicloId,
      pesoTotalKg: data.pesoTotalKg,
      pesoMedioGramas: data.pesoMedioGramas,
      quantidadeEstimado,
      valorKg: data.valorKg,
      valorTotal,
      observacao: data.observacao ?? null,
      tenantId: user.tenantId,
      empresaId: user.empresaId,
    },
  });

  // Registra no histórico do diário
  await prisma.registroDiario.create({
    data: {
      cicloId,
      tipo: 'DESPESCA_PARCIAL',
      detalhes: {
        descricao: `Desbaste: ${data.pesoTotalKg}kg · ${data.pesoMedioGramas}g médio · R$${data.valorKg}/kg`,
        quantidade: data.pesoTotalKg,
        unidade: 'kg',
        quantidadeEstimado,
        valorTotal,
        observacao: data.observacao,
      },
    },
  });

  return desbaste;
},

async resumosAtivos(user: { tenantId: string; empresaId: string }) {
  // Busca todos os ciclos ativos
  const ciclos = await prisma.ciclo.findMany({
    where: { tenantId: user.tenantId, empresaId: user.empresaId, status: 'ATIVO' },
    select: { id: true, quantidadeLarvas: true },
  });

  if (!ciclos.length) return {};

  const cicloIds = ciclos.map(c => c.id);

  // Busca todos os desbastes dos ciclos ativos em uma query só
  const desbastes = await prisma.desbaste.findMany({
    where: { cicloId: { in: cicloIds } },
    select: { cicloId: true, quantidadeEstimado: true },
  });

  // Agrupa por cicloId
  const removidosPorCiclo: Record<string, number> = {};
  for (const d of desbastes) {
    removidosPorCiclo[d.cicloId] = (removidosPorCiclo[d.cicloId] ?? 0) + d.quantidadeEstimado;
  }

  // Monta o resultado
  const resultado: Record<string, number> = {};
  for (const ciclo of ciclos) {
    const removidos = removidosPorCiclo[ciclo.id] ?? 0;
    resultado[ciclo.id] = ciclo.quantidadeLarvas - removidos;
  }

  return resultado; // { cicloId: animaisVivos }
},
};