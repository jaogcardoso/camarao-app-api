import { userRepository } from '../../repositories/user/userRepository.js';
import type { Prisma, Usuario } from '@prisma/client';
import bcrypt from 'bcryptjs';

export const userService = {

  async createUser(data: Prisma.UsuarioUncheckedCreateInput): Promise<Usuario> {

    const existingUser = await userRepository.findByEmail(
      data.email,
      data.tenantId
    );

    if (existingUser) {
      throw new Error('Este email já está em uso nesta empresa.');
    }

    const hashedPassword = await bcrypt.hash(data.senha, 8);

    return userRepository.create({
      ...data,
      senha: hashedPassword
    });

  }

};