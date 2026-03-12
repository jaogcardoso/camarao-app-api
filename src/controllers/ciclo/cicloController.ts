import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/authMiddleware.js";
import { cicloService } from "../../services/ciclo/cicloServices.js";

export const cicloController = {
  async create(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { viveiroId, quantidadeLarvas, fornecedorLarvasId, dataInicio } = req.body;

      if (!req.user) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const ciclo = await cicloService.iniciarPovoamento(
        {
          viveiroId,
          quantidadeLarvas,
          fornecedorLarvasId,
          dataInicio: new Date(dataInicio),
        },
        req.user
      );

      return res.status(201).json(ciclo);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || "Erro ao iniciar ciclo" });
    }
  },

  async listAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });

      const ciclos = await cicloService.listarTodosOsCiclos(req.user);
      return res.json(ciclos);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async show(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });

      const cicloId = Array.isArray(req.params.cicloId) ? req.params.cicloId[0] : req.params.cicloId;
      if (!cicloId) return res.status(400).json({ message: "O ID do ciclo é obrigatório." });

      const ciclo = await cicloService.buscarCicloPorId(cicloId, req.user);
      return res.json(ciclo);
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  },

  async finish(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });

      const cicloId = Array.isArray(req.params.cicloId) ? req.params.cicloId[0] : req.params.cicloId;
      if (!cicloId) return res.status(400).json({ message: "O ID do ciclo é obrigatório." });

      const ciclo = await cicloService.finalizarCiclo(cicloId, req.user);
      return res.json({ message: "Ciclo finalizado com sucesso!", ciclo });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },
};