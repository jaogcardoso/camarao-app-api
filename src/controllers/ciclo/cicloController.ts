import type { Request,Response } from "express";
import type { AuthRequest } from "../../middlewares/authMiddleware.js";
import { cicloService } from "../../services/ciclo/cicloServices.js";
import { prisma } from "../../lib/prisma.js";

export const cicloController = {
  async create(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { viveiroId, quantidadeLarvas, fornecedorLarvasId, custoLarvas } = req.body;
    const dataInicio = new Date();

    if (!req.user) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const ciclo = await cicloService.iniciarPovoamento(
      {
        viveiroId,
        quantidadeLarvas,
        fornecedorLarvasId,
        dataInicio,
        ...(custoLarvas !== undefined && { custoLarvas: Number(custoLarvas) }),
      },
      req.user
    );

    return res.status(201).json(ciclo);
  } catch (error: any) {
    return res.status(400).json({ message: error.message || "Erro ao iniciar ciclo" });
  }
},

  async listAll(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });

      const ciclos = await cicloService.listarTodosOsCiclos(req.user);
      return res.json(ciclos);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async show(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });

      const cicloId = Array.isArray(req.params.cicloId) ? req.params.cicloId[0] : req.params.cicloId;
      if (!cicloId) return res.status(400).json({ message: "O ID do ciclo é obrigatório." });

      const ciclo = await cicloService.buscarCicloPorId(cicloId, req.user);
      return res.json(ciclo);
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  },

  async finish(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });

      const cicloId = Array.isArray(req.params.cicloId) ? req.params.cicloId[0] : req.params.cicloId;
      if (!cicloId) return res.status(400).json({ message: "O ID do ciclo é obrigatório." });

      const ciclo = await cicloService.finalizarCiclo(cicloId, req.user);
      return res.json({ message: "Ciclo finalizado com sucesso!", ciclo });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  },

  async consumir(req: AuthRequest, res: Response) {
    if (!req.user) {
  return res.status(401).json({ message: "Usuário não autenticado" });
}
  try {
    const { cicloId } = req.params;
    const { produtoId, quantidade, unidadeDigitada } = req.body;

    if (!cicloId || typeof cicloId !== 'string') {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const result = await cicloService.registrarConsumo({
      cicloId,
      produtoId,
      quantidade,
      unidadeDigitada,
      tenantId: req.user.tenantId,
      empresaId: req.user.empresaId
    });

    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},
async resumo(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });

    const cicloId = Array.isArray(req.params.cicloId) ? req.params.cicloId[0] : req.params.cicloId;

    if (!cicloId || typeof cicloId !== 'string') {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const resumo = await cicloService.resumoCiclo(cicloId);
    return res.json(resumo);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},
async eventos(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });

    const cicloId = Array.isArray(req.params.cicloId) ? req.params.cicloId[0] : req.params.cicloId;
    if (!cicloId) return res.status(400).json({ message: "O ID do ciclo é obrigatório." });

    const eventos = await cicloService.listarEventos(cicloId, req.user);
    return res.json(eventos);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},

async biometria(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });

    const cicloId = Array.isArray(req.params.cicloId) ? req.params.cicloId[0] : req.params.cicloId;
    if (!cicloId) return res.status(400).json({ message: "O ID do ciclo é obrigatório." });

    const { pesoMedioGramas } = req.body;
    if (!pesoMedioGramas) return res.status(400).json({ message: "Peso médio é obrigatório" });

    const registro = await cicloService.registrarBiometria(
      cicloId,
      { pesoMedioGramas: Number(pesoMedioGramas) },
      req.user
    );
    return res.status(201).json(registro);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},

async despesca(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });

    const cicloId = Array.isArray(req.params.cicloId) ? req.params.cicloId[0] : req.params.cicloId;
    if (!cicloId) return res.status(400).json({ message: "O ID do ciclo é obrigatório." });

    const { pesoTotalKg, pesoMedioGramas, valorKg, observacao } = req.body;

    if (!pesoTotalKg || !pesoMedioGramas || !valorKg) {
      return res.status(400).json({ message: "Peso total, peso médio e valor por kg são obrigatórios" });
    }

    const registro = await cicloService.registrarDespesca(
      cicloId,
      {
        pesoTotalKg: Number(pesoTotalKg),
        pesoMedioGramas: Number(pesoMedioGramas),
        valorKg: Number(valorKg),
        observacao,
      },
      req.user
    );
    return res.status(201).json(registro);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},
async resumosAtivos(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });
    const resumos = await cicloService.resumosAtivos(req.user);
    return res.json(resumos);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},
async update(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });
    const cicloId = Array.isArray(req.params.cicloId) ? req.params.cicloId[0] : req.params.cicloId;
    if (!cicloId) return res.status(400).json({ message: "O ID do ciclo é obrigatório." });

    const { precoEsperadoKg, custoLarvas } = req.body;

    const ciclo = await cicloService.atualizarCiclo(cicloId, {
      ...(precoEsperadoKg !== undefined && { precoEsperadoKg: Number(precoEsperadoKg) }),
      ...(custoLarvas !== undefined && { custoLarvas: Number(custoLarvas) }),
    }, req.user);

    return res.json(ciclo);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},
async consumos(req: Request, res: Response) {
  try {
    const cicloId = req.params.cicloId as string;
    const data = await cicloService.getConsumos(cicloId);
    return res.json(data);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},

async desbastes(req: Request, res: Response) {
  try {
    const cicloId = req.params.cicloId as string;
    const desbastes = await prisma.desbaste.findMany({
      where: { cicloId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(desbastes);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},
async deletarEvento(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });

    const cicloId = req.params.cicloId as string;
    const eventoId = req.params.eventoId as string;

    // Busca o registro
    const registro = await prisma.registroDiario.findUnique({
      where: { id: eventoId }
    });

    if (!registro) return res.status(404).json({ message: "Evento não encontrado" });

    // Se for consumo, estorna o estoque
    if (registro.tipo === 'ALIMENTACAO' || registro.tipo === 'USO_INSUMO') {
      const detalhes = registro.detalhes as Record<string, any>;
      const produtoId = detalhes?.produtoId;

      if (produtoId) {
        // Busca o consumo vinculado
        const consumos = await prisma.consumoEstoque.findMany({
          where: { referenciaId: cicloId, referenciaTipo: 'CICLO' },
          include: { lote: { include: { produto: true } } },
          orderBy: { createdAt: 'desc' },
        });

        // Encontra o consumo mais próximo do registro
        const consumo = consumos.find(c =>
          c.lote.produto.id === produtoId &&
          Math.abs(new Date(c.createdAt).getTime() - new Date(registro.createdAt).getTime()) < 60000
        );

        if (consumo) {
          // Devolve ao lote
          await prisma.loteEstoque.update({
            where: { id: consumo.loteId },
            data: {
              quantidadeRestante: {
                increment: consumo.quantidade
              }
            }
          });
          // Remove o consumo
          await prisma.consumoEstoque.delete({ where: { id: consumo.id } });
        }
      }
    }

    // Remove o registro do diário
    await prisma.registroDiario.delete({ where: { id: eventoId } });

    return res.json({ message: "Evento removido com sucesso" });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},

async editarEvento(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.user) return res.status(401).json({ message: "Usuário não autenticado" });
    const { cicloId, eventoId } = req.params;
    const resultado = await cicloService.editarEvento(cicloId as string, eventoId as string, req.body, req.user);
    return res.json(resultado);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
},
};