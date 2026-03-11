
import { prisma } from "../../lib/prisma.js";

export const tenantRepository = {
  async findBySlug(slug: string) {
    return prisma.tenant.findUnique({
      where: { slug }
    });
  }
};