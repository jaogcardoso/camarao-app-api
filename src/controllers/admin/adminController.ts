import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const adminController = {
  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;
      const admin = await prisma.superAdmin.findUnique({ where: { email } });
      if (!admin) return res.status(401).json({ message: 'Credenciais inválidas' });

      const senhaValida = await bcrypt.compare(senha, admin.senha);
      if (!senhaValida) return res.status(401).json({ message: 'Credenciais inválidas' });

      const token = jwt.sign(
        { adminId: admin.id, role: 'SUPERADMIN' },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.json({ token, admin: { id: admin.id, email: admin.email } });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async listTenants(req: Request, res: Response) {
    try {
      const tenants = await prisma.tenant.findMany({
        include: {
          _count: { select: { usuarios: true, empresas: true } },
          empresas: { include: { _count: { select: { viveiros: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const result = await Promise.all(tenants.map(async (t) => {
        const ciclosAtivos = await prisma.ciclo.count({
          where: { tenantId: t.id, status: 'ATIVO' }
        });
        return {
          id: t.id,
          nome: t.nome,
          slug: t.slug,
          bloqueado: t.bloqueado,
          createdAt: t.createdAt,
          totalUsuarios: t._count.usuarios,
          totalEmpresas: t._count.empresas,
          totalViveiros: t.empresas.reduce((acc, e) => acc + e._count.viveiros, 0),
          ciclosAtivos,
        };
      }));

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async bloquear(req: Request, res: Response) {
    try {
      const tenantId = req.params.tenantId as string;
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { bloqueado: true }
      });
      return res.json({ message: 'Tenant bloqueado com sucesso' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async desbloquear(req: Request, res: Response) {
    try {
      const tenantId = req.params.tenantId as string;
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { bloqueado: false }
      });
      return res.json({ message: 'Tenant desbloqueado com sucesso' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async stats(req: Request, res: Response) {
    try {
      const tenantId = req.params.tenantId as string;
      const [tenant, ciclosAtivos, totalCiclos, totalProdutos] = await Promise.all([
        prisma.tenant.findUnique({
          where: { id: tenantId },
          include: {
            empresas: true,
            usuarios: { where: { deletedAt: null } },
          }
        }),
        prisma.ciclo.count({ where: { tenantId, status: 'ATIVO' } }),
        prisma.ciclo.count({ where: { tenantId } }),
        prisma.produto.count({ where: { tenantId, deletedAt: null } }),
      ]);

      return res.json({ tenant, ciclosAtivos, totalCiclos, totalProdutos });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },
};