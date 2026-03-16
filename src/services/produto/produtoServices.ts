import { produtoRepository } from '../../repositories/produto/produtoRepository.js';

export const produtoService = {
  async criarProduto(
  data: { nome: string; tipo: 'RACAO' | 'INSUMO'; unidadeMedida: string },
  user: { tenantId: string; empresaId: string }
) {
    const produtoExistente = await produtoRepository.findByName(data.nome);
    if (produtoExistente) {
      throw new Error('Já existe um produto cadastrado com este nome.');
    }

    const tiposValidos = ['RACAO', 'INSUMO'];
    if (!tiposValidos.includes(data.tipo)) {
      throw new Error('Tipo de produto inválido. Use RACAO ou INSUMO.');
    }

    return produtoRepository.create(data);
  },

  async listarProdutos() {
    return produtoRepository.findAll();
  },

  async buscarPorId(id: string) {
    const produto = await produtoRepository.findById(id);
    if (!produto) {
      throw new Error('Produto não encontrado.');
    }
    return produto;
  },

  async atualizarProduto(id: string, data: any) {

  const produto = await produtoRepository.findById(id);

  if (!produto) {
    throw new Error("Produto não encontrado");
  }

  return produtoRepository.update(id, data);
},

async deletarProduto(id: string) {

  const produto = await produtoRepository.findById(id);

  if (!produto) {
    throw new Error("Produto não encontrado");
  }

  return produtoRepository.softDelete(id);
}
};
