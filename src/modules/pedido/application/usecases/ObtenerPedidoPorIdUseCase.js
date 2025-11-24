/**
 * Caso de uso: Obtener Pedido por ID
 */
class ObtenerPedidoPorIdUseCase {
  constructor(pedidoRepository) {
    this.pedidoRepository = pedidoRepository;
  }

  async execute(id) {
    const pedido = await this.pedidoRepository.findById(id);
    
    if (!pedido) {
      throw new Error(`Pedido con id ${id} no encontrado`);
    }

    return pedido;
  }
}

module.exports = ObtenerPedidoPorIdUseCase;
