import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/authMiddleware.js";
import { viveiroService } from "../../services/viveiro/viveiroService.js";

export const viveiroController = {

  async create(req: AuthRequest, res: Response) {

    const viveiro = await viveiroService.create({
      ...req.body,
      tenantId: req.user!.tenantId,
      empresaId: req.user!.empresaId
    });

    return res.status(201).json(viveiro);

  },

  async list(req: AuthRequest, res: Response) {

    const viveiros = await viveiroService.list(
      req.user!.tenantId,
      req.user!.empresaId
    );

    return res.json(viveiros);

  },

  async update(req: AuthRequest, res: Response) {

    const id = req.params.id as string;

    const result = await viveiroService.update(
      id,
      req.user!.tenantId,
      req.user!.empresaId,
      req.body
    );

    return res.json(result);

  },

async delete(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;

    await viveiroService.delete(
      id,
      req.user!.tenantId,
      req.user!.empresaId
    );

    return res.status(204).send();

  } catch (error: any) {
    return res.status(404).json({
      message: error.message
    });
  }
}

};