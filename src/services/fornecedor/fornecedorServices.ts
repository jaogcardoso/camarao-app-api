import { fornecedorRepository } from '../../repositories/fornecedor/fornecedorRepository.js';

export const fornecedorService = {
  async criarFornecedor(data: any) {
  if (data.documento) {
    const existente = await fornecedorRepository.findByDocumento(data.documento);

    if (existente) {
      throw new Error('Fornecedor já cadastrado com esse documento');
    }
  }

  return fornecedorRepository.create(data);
},

  async listarFornecedores() {
    return fornecedorRepository.findAll();
  },

  async buscarPorId(id: string) {
    const fornecedor = await fornecedorRepository.findById(id);

    if (!fornecedor) {
      throw new Error('Fornecedor não encontrado');
    }

    return fornecedor;
  },

  async atualizarFornecedor(id: string, data: any) {
    await this.buscarPorId(id);
    return fornecedorRepository.update(id, data);
  },

  async deletarFornecedor(id: string) {
    await this.buscarPorId(id);
    return fornecedorRepository.softDelete(id);
  }
};