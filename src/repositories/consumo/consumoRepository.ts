import { prisma } from '../../lib/prisma.js';
import { Prisma } from '@prisma/client';

export const consumoRepository = {
  async create(data: {
    loteId: string;
    quantidade: number;
    custoUnitario: number;
    referenciaId?: string;
    referenciaTipo?: string;
  }) {
    const quantidade = new Prisma.Decimal(data.quantidade);
    const custoUnitario = new Prisma.Decimal(data.custoUnitario);

    return prisma.consumoEstoque.create({
      data: {
        loteId: data.loteId,
        quantidade,
        custoUnitario,
        custoTotal: quantidade.mul(custoUnitario),
        referenciaId: data.referenciaId || null,
        referenciaTipo: data.referenciaTipo || null
      }
    });
  }
};