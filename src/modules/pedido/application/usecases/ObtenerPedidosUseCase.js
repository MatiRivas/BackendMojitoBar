/**
 * Caso de uso: Obtener Pedidos
 */
class ObtenerPedidosUseCase {
  constructor(pedidoRepository) {
    this.pedidoRepository = pedidoRepository;
  }

  async execute(filtros = {}) {
    if (filtros.estado) {
      return await this.pedidoRepository.findByEstado(filtros.estado);
    }
    
    return await this.pedidoRepository.findAll();
  }
}

module.exports = ObtenerPedidosUseCase;
