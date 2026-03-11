import type { Request, Response } from "express";
import { userService } from "../../services/user/userServices.js";
import { authService } from "../../services/user/authServices.js";

export const userController = {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const user = await userService.createUser(req.body);

      const { senha: _, ...userWithoutPassword } = user;

      return res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, senha } = req.body;

      const { user, token } = await authService.authenticate(email, senha);

      const { senha: _, ...userWithoutPassword } = user;

      return res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      return res.status(401).json({ message: error.message });
    }
  },
};