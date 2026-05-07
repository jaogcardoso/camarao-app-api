import type { Request, Response } from 'express';
import { estoqueService } from '../../services/estoque/estoqueServices.js';

export const estoqueController = {
  async entrada(req: Request, res: Response) {
    try {
      const { produtoId, fornecedorId, quantidade, unidadeDigitada, valor } = req.body;

      const tenantId = req.user.tenantId;
      const empresaId = req.user.empresaId;

      const result = await estoqueService.entrada({
        produtoId,
        fornecedorId,
        quantidade: Number(quantidade),
        unidadeDigitada: unidadeDigitada ?? 'g',
        valor: Number(valor),
        tenantId,
        empresaId,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async resumo(req: Request, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const empresaId = req.user.empresaId;

      const data = await estoqueService.resumoEstoque({ tenantId, empresaId });
      return res.json(data);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async historico(req: Request, res: Response) {
  try {
    const tenantId = req.user.tenantId;
    const empresaId = req.user.empresaId;
    const data = await estoqueService.historicoEntradas({ tenantId, empresaId });
    return res.json(data);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},

async editarLote(req: Request, res: Response) {
  try {
    const { loteId } = req.params;
    const { quantidade, valor } = req.body;
    const data = await estoqueService.editarLote(loteId as string, {
      quantidade: Number(quantidade),
      valor: Number(valor),
    });
    return res.json(data);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},

async deletarLote(req: Request, res: Response) {
  try {
    const { loteId } = req.params;
    const tenantId = req.user.tenantId;
    const empresaId = req.user.empresaId;
    await estoqueService.deletarLote(loteId as string, { tenantId, empresaId });
    return res.json({ message: 'Lote removido com sucesso' });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},
};