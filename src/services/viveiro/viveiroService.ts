import { viveiroRepository } from "../../repositories/viveiro/viveiroRepository.js";
import { prisma } from "../../lib/prisma.js";

export const viveiroService = {

  async create(data: any) {
    return viveiroRepository.create(data);
  },

  async list(tenantId: string, empresaId: string) {
    return viveiroRepository.findAll(tenantId, empresaId);
  },

  async update(
    id: string,
    tenantId: string,
    empresaId: string,
    data: any
  ) {
    return viveiroRepository.update(id, tenantId, empresaId, data);
  },

 async delete(id: string, tenantId: string, empresaId: string) {

  const result = await viveiroRepository.delete(
    id,
    tenantId,
    empresaId
  );

  if (result.count === 0) {
    throw new Error("Viveiro não encontrado");
  }

  return true;
}

};