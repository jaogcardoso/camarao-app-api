import type { Request, Response } from 'express';
import { estoqueService } from '../../services/estoque/estoqueServices.js';

export const estoqueController = {
  async entrada(req: Request, res: Response) {
    try {
      const { produtoId, fornecedorId, quantidade, valor } = req.body;

      const tenantId = req.user.tenantId;
      const empresaId = req.user.empresaId;

      const result = await estoqueService.entrada({
        produtoId,
        fornecedorId,
        quantidade: Number(quantidade),
        valor: Number(valor),
        tenantId,
        empresaId,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  },
  async resumo(req: Request, res: Response) {
  try {
    const tenantId = req.user.tenantId;
    const empresaId = req.user.empresaId;

    const data = await estoqueService.resumoEstoque({
      tenantId,
      empresaId,
    });

    return res.json(data);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}
};