import type { Request, Response } from 'express';
import { consumoService } from '../../services/consumo/consumoServices.js';

export const consumoController = {
  async consumir(req: Request, res: Response) {
    try {
      const { produtoId, quantidade, referenciaId, referenciaTipo } = req.body;

      if (!quantidade || quantidade <= 0) {
        return res.status(400).json({
          message: 'Quantidade inválida'
        });
      }

      const resultado = await consumoService.consumirEstoque({
        produtoId,
        quantidade,
        referenciaId,
        referenciaTipo
      });

      return res.status(200).json(resultado);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message
      });
    }
  }
};