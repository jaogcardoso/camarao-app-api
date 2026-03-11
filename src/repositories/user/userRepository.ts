import { prisma } from "../../lib/prisma.js";
import type { Usuario } from "@prisma/client";

export const userRepository = {
  async findByEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({ where: { email } });
  },

  async create(data: Omit<Usuario, "id" | "createdAt">): Promise<Usuario> {
    return prisma.usuario.create({ data });
  },
};