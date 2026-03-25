import { prisma } from '../../lib/prisma.js';
import { loteService } from '../lote/loteServices.js';

export const estoqueService = {
  async entrada({
    produtoId,
    fornecedorId,
    quantidade,
    valor,
    tenantId,
    empresaId,
  }: {
    produtoId: string;
    fornecedorId: string;
    quantidade: number;
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

    // 🔥 calcula automaticamente
    const custoUnitario = valor / quantidade;

    // 🔥 usa o loteService (reaproveita sua lógica)
    return loteService.criarLote({
      produtoId,
      fornecedorId,
      quantidadeInicial: quantidade,
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
}
};