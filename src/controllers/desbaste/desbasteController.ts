import type { Request, Response } from 'express';
import { cicloService } from '../../services/ciclo/cicloServices.js';

export const desbasteController = {
  async create(req: Request, res: Response) {
    try {
      const desbaste = await cicloService.registrarDesbaste(req.body);

      return res.status(201).json(desbaste);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const { cicloId } = req.query;

      if (!cicloId || typeof cicloId !== 'string') {
        return res.status(400).json({ message: 'cicloId inválido' });
      }

      const desbastes = await cicloService.listarDesbastes(cicloId);

      return res.json(desbastes);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
};