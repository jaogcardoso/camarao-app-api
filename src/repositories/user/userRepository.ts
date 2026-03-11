import { prisma } from "../../lib/prisma.js";

export const userRepository = {

  async findByEmail(email: string, tenantId: string) {
    return prisma.usuario.findFirst({
      where: {
        email,
        tenantId
      }
    });
  },

  async create(data: any) {
    return prisma.usuario.create({
      data
    });
  }

};