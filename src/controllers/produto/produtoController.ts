import type { Request, Response } from 'express';
import { produtoService } from '../../services/produto/produtoServices.js';
import type { AuthRequest } from '../../middlewares/authMiddleware.js';

export const produtoController = {

  async create(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const produto = await produtoService.criarProduto(req.body, req.user);

    return res.status(201).json(produto);

  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},
  async list(req: Request, res: Response): Promise<Response> {
    try {
      const produtos = await produtoService.listarProdutos();
      return res.json(produtos);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

async show(req: Request, res: Response): Promise<Response> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) return res.status(400).json({ message: 'ID é obrigatório.' });

    const produto = await produtoService.buscarPorId(id);
    return res.json(produto);
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
},
async update(req: Request, res: Response): Promise<Response> {

  try {

    const { id } = req.params;

    const produto = await produtoService.atualizarProduto(
      id as string,
      req.body
    );

    return res.json(produto);

  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }

},
async remove(req: Request, res: Response): Promise<Response> {

  try {

    const { id } = req.params;

    await produtoService.deletarProduto(id as string);

    return res.status(204).send();

  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }

}
};
