
import type { Request, Response } from "express"
import { userService } from '../../services/user/userServices.js';

export const userController = {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const user = await userService.createUser(req.body);
      // Não retornar a senha na resposta!
      const { senha, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },
};
