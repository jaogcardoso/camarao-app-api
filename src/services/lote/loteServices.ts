import { loteRepository } from '../../repositories/lote/loteRepository.js';
import { produtoRepository } from '../../repositories/produto/produtoRepository.js';
import { fornecedorRepository } from '../../repositories/fornecedor/fornecedorRepository.js';

export const loteService = {
  async criarLote(data: any) {

    const produto = await produtoRepository.findById(data.produtoId);
    if (!produto) throw new Error('Produto não encontrado');

    const fornecedor = await fornecedorRepository.findById(data.fornecedorId);
    if (!fornecedor) throw new Error('Fornecedor não encontrado');


    if (!data.quantidadeInicial || data.quantidadeInicial <= 0) {
      throw new Error('Quantidade inicial inválida');
    }

    if (!data.custoUnitario || data.custoUnitario <= 0) {
      throw new Error('Custo unitário inválido');
    }

    return loteRepository.create({
      ...data,
      quantidadeRestante: data.quantidadeInicial
    });
  },

  async listarLotes() {
    return loteRepository.findAll();
  },

  async buscarPorId(id: string) {
    const lote = await loteRepository.findById(id);

    if (!lote) {
      throw new Error('Lote não encontrado');
    }

    return lote;
  },

  async deletarLote(id: string) {
    await this.buscarPorId(id);
    return loteRepository.softDelete(id);
  }
};