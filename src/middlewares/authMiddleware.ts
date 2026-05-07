import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { setContext } from "../context/requestContext.js";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET!;

export type AuthRequest = Request;

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token não informado" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token não informado" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const tenant = await prisma.tenant.findUnique({
      where: { id: decoded.tenantId },
      select: { bloqueado: true }
    });

    if (tenant?.bloqueado) {
      return res.status(403).json({
        message: 'Acesso bloqueado. Entre em contato com o suporte.',
        bloqueado: true
      });
    }

    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      empresaId: decoded.empresaId
    };

    setContext({
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      empresaId: decoded.empresaId
    });

    next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
}