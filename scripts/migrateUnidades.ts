import { prisma } from '../src/lib/prisma.js';

async function main() {
  const produtos = await prisma.produto.findMany();

  for (const p of produtos) {
    const unidade = p.unidadeMedida.toLowerCase();

    let tipoUnidade: 'WEIGHT' | 'VOLUME' | 'OTHER' = 'OTHER';
    let unidadeBase = 'unidade';

    if (['kg', 'g', 't'].includes(unidade)) {
      tipoUnidade = 'WEIGHT';
      unidadeBase = 'g';
    } else if (['l', 'ml'].includes(unidade)) {
      tipoUnidade = 'VOLUME';
      unidadeBase = 'ml';
    }

    await prisma.produto.update({
      where: { id: p.id },
      data: { tipoUnidade, unidadeBase },
    });

    console.log(`✅ ${p.nome} → ${tipoUnidade} (base: ${unidadeBase})`);
  }

  // Migra lotes existentes para unidade base
  const lotes = await prisma.loteEstoque.findMany({
    include: { produto: true }
  });

  for (const lote of lotes) {
    const unidade = lote.produto.unidadeMedida.toLowerCase();
    let fator = 1;

    if (unidade === 'kg') fator = 1000;
    if (unidade === 't') fator = 1000000;
    if (unidade === 'l') fator = 1000;

    if (fator !== 1) {
      await prisma.loteEstoque.update({
        where: { id: lote.id },
        data: {
          quantidadeInicial: Number(lote.quantidadeInicial) * fator,
          quantidadeRestante: Number(lote.quantidadeRestante) * fator,
          custoUnitario: Number(lote.custoUnitario) / fator,
        },
      });
      console.log(`📦 Lote ${lote.id} convertido (fator ${fator})`);
    }
  }

  // Migra consumos existentes
  const consumos = await prisma.consumoEstoque.findMany({
    include: { lote: { include: { produto: true } } }
  });

  for (const consumo of consumos) {
    const unidade = consumo.lote.produto.unidadeMedida.toLowerCase();
    let fator = 1;

    if (unidade === 'kg') fator = 1000;
    if (unidade === 't') fator = 1000000;
    if (unidade === 'l') fator = 1000;

    if (fator !== 1) {
      await prisma.consumoEstoque.update({
        where: { id: consumo.id },
        data: {
          quantidade: Number(consumo.quantidade) * fator,
          custoUnitario: Number(consumo.custoUnitario) / fator,
          custoTotal: Number(consumo.custoTotal), // mantém igual
        },
      });
      console.log(`🔄 Consumo ${consumo.id} convertido`);
    }
  }

  console.log('✅ Migração concluída!');
}

main().catch(console.error).finally(() => prisma.$disconnect());