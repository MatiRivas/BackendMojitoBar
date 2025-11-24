/**
 * Caso de uso: Actualizar Estado de Pedido
 */
class ActualizarEstadoPedidoUseCase {
  constructor(pedidoRepository, eventPublisher) {
    this.pedidoRepository = pedidoRepository;
    this.eventPublisher = eventPublisher;
  }

  async execute(id, nuevoEstado) {
    // Obtener pedido existente
    const pedido = await this.pedidoRepository.findById(id);
    
    if (!pedido) {
      throw new Error(`Pedido con id ${id} no encontrado`);
    }

    const estadoAnterior = pedido.estado;
    
    // Cambiar estado
    pedido.cambiarEstado(nuevoEstado);

    // Persistir cambios
    const pedidoActualizado = await this.pedidoRepository.update(pedido);

    // Publicar evento de dominio
    if (this.eventPublisher) {
      await this.eventPublisher.publish('pedido_estado_actualizado', {
        pedidoId: pedido.id,
        estadoAnterior,
        estadoNuevo: nuevoEstado,
        timestamp: new Date().toISOString(),
      });
    }

    return pedidoActualizado;
  }
}

module.exports = ActualizarEstadoPedidoUseCase;
