// Fatores de conversão para unidade base
export const FATORES: Record<string, number> = {
  g: 1,
  kg: 1000,
  t: 1000000,
  ml: 1,
  l: 1000,
};

export function paraBase(valor: number, unidade: string): number {
  const fator = FATORES[unidade.toLowerCase()] ?? 1;
  return valor * fator;
}

export function deBase(valorBase: number, unidade: string): number {
  const fator = FATORES[unidade.toLowerCase()] ?? 1;
  return valorBase / fator;
}

// Formata para exibição amigável
export function formatarQuantidade(valorBase: number, unitType: string): string {
  if (unitType === 'WEIGHT') {
    if (valorBase >= 1000000) return `${(valorBase / 1000000).toFixed(2)} t`;
    if (valorBase >= 1000) return `${(valorBase / 1000).toFixed(2)} kg`;
    return `${valorBase.toFixed(0)} g`;
  }
  if (unitType === 'VOLUME') {
    if (valorBase >= 1000) return `${(valorBase / 1000).toFixed(2)} L`;
    return `${valorBase.toFixed(0)} ml`;
  }
  return `${valorBase}`;
}