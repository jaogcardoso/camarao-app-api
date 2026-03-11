import jwt from 'jsonwebtoken';
import { userRepository } from '../../repositories/user/userRepository.js';
import bcrypt from 'bcryptjs';
import type { Jwt } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string

export const authService = {
  // ... createUser anterior ...

  async authenticate(email: string, senhaPlana: string) {
    // 1. Buscar o usuário pelo email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Email ou senha incorretos.');
    }

    // 2. Comparar a senha enviada com a senha criptografada no banco
    const passwordMatch = await bcrypt.compare(senhaPlana, user.senha);
    if (!passwordMatch) {
      throw new Error('Email ou senha incorretos.');
    }

    // 3. Gerar o Token JWT
    // O 'secret' deve ser uma string única e secreta. No futuro, coloque no .env!
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '1d' } // O token vale por 1 dia
    );

    return { user, token };
  }
};
