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
  },

  async listAll(req: Request, res: Response): Promise<Response> {
    try {
      const ciclos = await cicloService.listarTodosOsCiclos();
      return res.json(ciclos);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },
   
   async show(req: Request, res: Response): Promise<Response> {
    try {
      const { cicloId } = req.params; // Pegamos o ID que vem da rota :cicloId

      // Validação de segurança para o TypeScript
      if (!cicloId || typeof cicloId !== 'string') {
        return res.status(400).json({ message: 'O ID do ciclo é obrigatório.' });
      }

      // Chamamos o serviço para buscar esse ciclo específico
      const ciclo = await cicloService.buscarCicloPorId(cicloId);
      
      return res.json(ciclo);
    } catch (error: any) {
      // Se não encontrar, retornamos 404 (Not Found)
      return res.status(404).json({ message: error.message });
    }
  },


  async finish(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'O ID do ciclo é obrigatório e deve ser uma string.' });
      }

      const ciclo = await cicloService.finalizarCiclo(id);
      return res.json({ message: 'Ciclo finalizado com sucesso!', ciclo });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
};
