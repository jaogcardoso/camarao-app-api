// src/services/userService.ts
import { userRepository } from '../../repositories/user/userRepository.js';
import type { Usuario } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Precisaremos instalar isso!

export const userService = {
  async createUser(data: Omit<Usuario, 'id' | 'createdAt'>): Promise<Usuario> {
    // 1. Verificar se o email já existe
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Este email já está em uso.');
    }

    // 2. Criptografar a senha
    const hashedPassword = await bcrypt.hash(data.senha, 8);

    // 3. Chamar o repositório para criar o usuário
    return userRepository.create({ ...data, senha: hashedPassword });
  },
};
