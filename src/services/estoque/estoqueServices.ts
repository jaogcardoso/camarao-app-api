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
  }
};