import { prisma } from "../../lib/prisma.js";

export const viveiroRepository = {

  async create(data: any) {
    return prisma.viveiro.create({
      data
    });
  },

  async findAll(tenantId: string, empresaId: string) {
    return prisma.viveiro.findMany({
      where: {
        tenantId,
        empresaId
      }
    });
  },

  async update(
    id: string,
    tenantId: string,
    empresaId: string,
    data: any
  ) {
    return prisma.viveiro.updateMany({
      where: {
        id,
        tenantId,
        empresaId
      },
      data
    });
  },

 async delete(id: string, tenantId: string, empresaId: string) {
    return prisma.viveiro.updateMany({
      where: {
        id,
        tenantId,
        empresaId,
        deletedAt: null
      },
      data: {
        deletedAt: new Date()
      }
    });
  }
};

