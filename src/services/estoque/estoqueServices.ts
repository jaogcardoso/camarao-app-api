import { prisma } from '../../lib/prisma.js';
import { loteService } from '../lote/loteServices.js';
import { paraBase } from '../../utils/unidade.js';

export const estoqueService = {
  async entrada({
    produtoId,
    fornecedorId,
    quantidade,
    unidadeDigitada,
    valor,
    tenantId,
    empresaId,
  }: {
    produtoId: string;
    fornecedorId: string;
    quantidade: number;
    unidadeDigitada: string;
    valor: number;
    tenantId: string;
    empresaId: string;
  }) {
    if (!quantidade || quantidade <= 0) {
      throw new Error('Quantidade inválida');
    }

    if (!valor || valor <= 0) {
      throw new Error('Valor inválido');
    }

    // Converte para unidade base (g ou ml)
    const quantidadeBase = paraBase(quantidade, unidadeDigitada);
    const custoUnitario = valor / quantidadeBase;

    return loteService.criarLote({
      produtoId,
      fornecedorId,
      quantidadeInicial: quantidadeBase,
      custoUnitario,
      tenantId,
      empresaId,
    });
  },

  async resumoEstoque({ tenantId, empresaId }: any) {
    const resultado = await prisma.loteEstoque.groupBy({
      by: ['produtoId'],
      where: {
        tenantId,
        empresaId,
        deletedAt: null,
      },
      _sum: {
        quantidadeRestante: true,
      },
    });

    return resultado;
  },

async historicoEntradas({ tenantId, empresaId }: any) {
  const lotes = await prisma.loteEstoque.findMany({
    where: { tenantId, empresaId, deletedAt: null },
    include: {
      produto: { select: { nome: true, unidadeMedida: true, tipo: true } },
      fornecedor: { select: { nome: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return lotes.map(l => ({
    id: l.id,
    produto: l.produto.nome,
    tipo: l.produto.tipo,
    unidade: l.produto.unidadeMedida,
    fornecedor: l.fornecedor?.nome ?? '—',
    quantidadeInicial: Number(l.quantidadeInicial),
    quantidadeRestante: Number(l.quantidadeRestante),
    custoUnitario: Number(l.custoUnitario),
    valorTotal: Number(l.quantidadeInicial) * Number(l.custoUnitario),
    createdAt: l.createdAt,
  }));
},

async editarLote(loteId: string, data: { quantidade: number; valor: number }) {
  const custoUnitario = data.valor / data.quantidade;
  
  // Calcula a diferença para ajustar quantidadeRestante
  const lote = await prisma.loteEstoque.findUnique({ where: { id: loteId } });
  if (!lote) throw new Error('Lote não encontrado');
  
  const diffQuantidade = data.quantidade - Number(lote.quantidadeInicial);

  return prisma.loteEstoque.update({
    where: { id: loteId },
    data: {
      quantidadeInicial: data.quantidade,
      quantidadeRestante: { increment: diffQuantidade },
      custoUnitario,
    },
  });
},

async deletarLote(loteId: string, { tenantId, empresaId }: any) {
  const lote = await prisma.loteEstoque.findFirst({
    where: { id: loteId, tenantId, empresaId }
  });
  if (!lote) throw new Error('Lote não encontrado');

  // Verifica se tem consumos
  const consumos = await prisma.consumoEstoque.count({
    where: { loteId }
  });

  if (consumos > 0) throw new Error('Este lote já possui consumos registrados e não pode ser excluído');

  return prisma.loteEstoque.update({
    where: { id: loteId },
    data: { deletedAt: new Date() }
  });
},
};