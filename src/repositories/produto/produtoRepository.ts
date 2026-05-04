import { prisma } from '../../lib/prisma.js';
import { getContext } from '../../context/requestContext.js';


export const produtoRepository = {

  async create(data: {
  nome: string
  tipo: 'RACAO' | 'INSUMO'
  unidadeMedida: string
}) {
  const { tenantId, empresaId } = getContext();

  return prisma.produto.create({
    data: {
      nome: data.nome,
      tipo: data.tipo,
      unidadeMedida: data.unidadeMedida,

      tenant: {
        connect: { id: tenantId! }
      },

      empresa: {
        connect: { id: empresaId! }
      }
    }
  });

},

  async findByName(nome: string) {

    const { tenantId, empresaId } = getContext();

    return prisma.produto.findFirst({
      where: {
        nome,
        tenantId: tenantId!,
        empresaId: empresaId!,
        deletedAt: null
      }
    });

  },

 async findAll() {

  const { tenantId, empresaId } = getContext();

  return prisma.produto.findMany({
    where: {
      tenantId: tenantId!,
      empresaId: empresaId!,
      deletedAt: null
    },
    include: {
      lotes: true
    },
    orderBy: {
      nome: 'asc'
    }
  });

},

async findById(id: string) {

  const { tenantId, empresaId } = getContext();

  return prisma.produto.findFirst({
    where: {
      id,
      tenantId: tenantId!,
      empresaId: empresaId!,
      deletedAt: null
    },
    include: {
      lotes: true
    }
  });

},

  async update(id: string, data: {
  nome?: string
  tipo?: 'RACAO' | 'INSUMO'
  unidadeMedida?: string
}) {

  const { tenantId, empresaId } = getContext();

  return prisma.produto.update({
    where: { id },
    data,
  });

},
async softDelete(id: string) {

  const { tenantId, empresaId } = getContext();

  return prisma.produto.update({
    where: { id },
    data: {
      deletedAt: new Date()
    }
  });

}


};