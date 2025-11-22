/**
 * Caso de uso: Actualizar Inventario
 * Lógica de aplicación independiente de frameworks e infraestructura
 */
class ActualizarInventarioUseCase {
  constructor(inventarioRepository, eventPublisher) {
    this.inventarioRepository = inventarioRepository;
    this.eventPublisher = eventPublisher;
  }

  async execute(inventarioId, nuevaCantidad) {
    // Obtener inventario existente
    const inventario = await this.inventarioRepository.findById(inventarioId);
    
    if (!inventario) {
      throw new Error(`Inventario con id ${inventarioId} no encontrado`);
    }

    // Aplicar lógica de dominio
    const cantidadAnterior = inventario.cantidad;
    inventario.actualizarCantidad(nuevaCantidad);

    // Persistir cambios
    const inventarioActualizado = await this.inventarioRepository.update(inventario);

    // Publicar evento de dominio
    if (this.eventPublisher) {
      await this.eventPublisher.publish('inventario_actualizado', {
        inventarioId: inventario.id,
        productoId: inventario.productoId,
        cantidadAnterior,
        cantidadNueva: inventario.cantidad,
        timestamp: new Date().toISOString(),
      });
    }

    return inventarioActualizado;
  }
}

module.exports = ActualizarInventarioUseCase;
