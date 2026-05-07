import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token não informado' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token não informado' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}