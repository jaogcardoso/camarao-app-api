import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { tenantRepository } from "../../repositories/user/tenantRepository.js";
import { userRepository } from "../../repositories/user/userRepository.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authService = {

  async authenticate(login: string, senhaPlana: string) {

    const [email, tenantSlug] = login.split(".");

    if (!email || !tenantSlug) {
      throw new Error("Login inválido. Use usuario.tenant");
    }

    const tenant = await tenantRepository.findBySlug(tenantSlug);

    if (!tenant) {
      throw new Error("Tenant não encontrado");
    }

    const user = await userRepository.findByEmail(email, tenant.id);

    if (!user) {
      throw new Error("Email ou senha incorretos.");
    }

    const passwordMatch = await bcrypt.compare(senhaPlana, user.senha);

    if (!passwordMatch) {
      throw new Error("Email ou senha incorretos.");
    }

    const token = jwt.sign(
      {
        id: user.id,
        tenantId: user.tenantId,
        empresaId: user.empresaId,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return { user, token };

  }
};