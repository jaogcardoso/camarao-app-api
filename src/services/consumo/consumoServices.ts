import { Prisma } from '@prisma/client';
import { loteRepository } from '../../repositories/lote/loteRepository.js';
import { prisma } from '../../lib/prisma.js';

export const consumoService = {
  async consumirEstoque(data: {
    produtoId: string;
    quantidade: number;
    referenciaId?: string;
    referenciaTipo?: string;
  }) {
    if (!data.quantidade || data.quantidade <= 0) {
      throw new Error('Quantidade inválida');
    }

    const lotes = await loteRepository.findDisponiveisFIFO();

    if (!lotes.length) {
      throw new Error('Sem estoque disponível');
    }

    const totalDisponivel = lotes.reduce(
      (acc, lote) => acc + Number(lote.quantidadeRestante),
      0
    );

    if (totalDisponivel < data.quantidade) {
      throw new Error('Estoque insuficiente');
    }

    let restante = data.quantidade;
    const consumos: any[] = [];

    await prisma.$transaction(async (tx) => {
      for (const lote of lotes) {
        if (restante <= 0) break;

        const disponivel = Number(lote.quantidadeRestante);
        if (disponivel <= 0) continue;

        const consumir = Math.min(disponivel, restante);

        const consumo = await tx.consumoEstoque.create({
          data: {
            loteId: lote.id,
            quantidade: new Prisma.Decimal(consumir),
            custoUnitario: lote.custoUnitario,
            custoTotal: new Prisma.Decimal(consumir).mul(
              lote.custoUnitario
            ),
            referenciaId: data.referenciaId || null,
            referenciaTipo: data.referenciaTipo || null
          }
        });

        consumos.push(consumo);

        await tx.loteEstoque.update({
          where: { id: lote.id },
          data: {
            quantidadeRestante: new Prisma.Decimal(disponivel - consumir)
          }
        });

        restante -= consumir;
      }
    });

    const totalConsumido = consumos.reduce(
      (acc, c) => acc + Number(c.quantidade),
      0
    );

    const custoTotal = consumos.reduce(
      (acc, c) => acc + Number(c.custoTotal),
      0
    );

    return {
      quantidadeConsumida: totalConsumido,
      custoTotal,
      custoMedio: custoTotal / totalConsumido
    };
  }
};