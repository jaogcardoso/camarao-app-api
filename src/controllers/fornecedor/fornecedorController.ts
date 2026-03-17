import type { Request, Response } from 'express';
import { fornecedorService } from '../../services/fornecedor/fornecedorServices.js';

export const fornecedorController = {
  async create(req: Request, res: Response) {
    try {
      const fornecedor = await fornecedorService.criarFornecedor(req.body);
      return res.status(201).json(fornecedor);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const fornecedores = await fornecedorService.listarFornecedores();
      return res.json(fornecedores);
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

    const fornecedor = await fornecedorService.buscarPorId(id);
    return res.json(fornecedor);
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
},

async update(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const fornecedor = await fornecedorService.atualizarFornecedor(
      id,
      req.body
    );

    return res.json(fornecedor);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},

async delete(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID inválido' });
    }

    await fornecedorService.deletarFornecedor(id);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}
};