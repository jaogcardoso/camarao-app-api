import { prisma } from '../../lib/prisma.js';
import { getContext } from '../../context/requestContext.js';

export const fornecedorRepository = {
  async create(data: {
    nome: string;
    documento?: string;
    telefone?: string;
    email?: string;
  }) {
    const { tenantId, empresaId } = getContext();

    return prisma.fornecedor.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId! } },
        empresa: { connect: { id: empresaId! } }
      }
    });
  },

  async findAll() {
    const { tenantId, empresaId } = getContext();

    return prisma.fornecedor.findMany({
      where: {
        tenantId: tenantId!,
        empresaId: empresaId!,
        deletedAt: null
      },
      orderBy: { nome: 'asc' }
    });
  },

  async findById(id: string) {
    const { tenantId, empresaId } = getContext();

    return prisma.fornecedor.findFirst({
      where: {
        id,
        tenantId: tenantId!,
        empresaId: empresaId!,
        deletedAt: null
      }
    });
  },
  async findByDocumento(documento: string) {
  const { tenantId, empresaId } = getContext();

  return prisma.fornecedor.findFirst({
    where: {
      documento,
      tenantId: tenantId!,
      empresaId: empresaId!,
      deletedAt: null
    }
  });
},

  async update(id: string, data: any) {
    return prisma.fornecedor.update({
      where: { id },
      data
    });
  },

  async softDelete(id: string) {
    return prisma.fornecedor.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
};