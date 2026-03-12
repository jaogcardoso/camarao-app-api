import type { Request, Response } from "express";
import { cicloService } from "../../services/ciclo/cicloServices.js";

export const cicloController = {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { viveiroId, quantidadeLarvas, fornecedorLarvasId, dataInicio } = req.body;

      // pega tenant do usuário autenticado
      const tenantId = (req as any).user.tenantId;

      const ciclo = await cicloService.iniciarPovoamento({
        viveiroId,
        quantidadeLarvas,
        fornecedorLarvasId,
        dataInicio: new Date(dataInicio),
        
      });
      
      return res.status(201).json(ciclo);
      
      

    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Erro ao iniciar ciclo"
      });
    }
  }
};
