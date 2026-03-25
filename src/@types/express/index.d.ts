declare namespace Express {
  export interface Request {
    user: {
      tenantId: string;
      empresaId: string;
      userId: string;
    };
  }
}