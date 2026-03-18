import type { Request, Response } from 'express';
import { loteService } from '../../services/lote/loteServices.js';

export const loteController = {
  async create(req: Request, res: Response) {
    try {
      const lote = await loteService.criarLote(req.body);
      return res.status(201).json(lote);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const lotes = await loteService.listarLotes();
      return res.json(lotes);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async show(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'ID inválido' });
      }

      const lote = await loteService.buscarPorId(id);
      return res.json(lote);
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'ID inválido' });
      }

      await loteService.deletarLote(id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
};