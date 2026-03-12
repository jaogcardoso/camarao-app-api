import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    empresaId: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não informado" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token inválido" });
  }

  try {

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      empresaId: decoded.empresaId
    };

    next();

  } catch {
    return res.status(401).json({
      message: "Token inválido ou expirado"
    });
  }
}