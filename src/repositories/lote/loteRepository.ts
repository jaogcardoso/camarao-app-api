import { prisma } from '../../lib/prisma.js';
import { getContext } from '../../context/requestContext.js';
import { Prisma } from '@prisma/client';

export const loteRepository = {
  async create(data: {
    produtoId: string;
    fornecedorId: string;
    quantidadeInicial: number;
    quantidadeRestante: number;
    custoUnitario: number;
    dataCompra?: Date;
  }) {
    const { tenantId, empresaId } = getContext();

    return prisma.loteEstoque.create({
      data: {
        produtoId: data.produtoId,
        fornecedorId: data.fornecedorId,

        quantidadeInicial: new Prisma.Decimal(data.quantidadeInicial),
        quantidadeRestante: new Prisma.Decimal(data.quantidadeRestante),
        custoUnitario: new Prisma.Decimal(data.custoUnitario),

        dataCompra: data.dataCompra ?? new Date(),

        tenantId: tenantId!,
        empresaId: empresaId!
      }
    });
  },

  async findAll() {
    const { tenantId, empresaId } = getContext();

    return prisma.loteEstoque.findMany({
      where: {
        tenantId: tenantId!,
        empresaId: empresaId!,
        deletedAt: null
      },
      include: {
        produto: true,
        fornecedor: true
      },
      orderBy: { dataCompra: 'desc' }
    });
  },

  async findById(id: string) {
    const { tenantId, empresaId } = getContext();

    return prisma.loteEstoque.findFirst({
      where: {
        id,
        tenantId: tenantId!,
        empresaId: empresaId!,
        deletedAt: null
      },
      include: {
        produto: true,
        fornecedor: true
      }
    });
  },
async findDisponiveisFIFO(produtoId?: string) {
  const { tenantId, empresaId } = getContext();

  return prisma.loteEstoque.findMany({
    where: {
      tenantId: tenantId!,
      empresaId: empresaId!,
      deletedAt: null,
      quantidadeRestante: {
        gt: 0
      },
      produtoId: produtoId!
    },
    orderBy: {
      dataCompra: 'asc'
    }
  });
},
  async softDelete(id: string) {
    return prisma.loteEstoque.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
};