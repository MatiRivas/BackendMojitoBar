const Pedido = require('../../domain/entities/Pedido');
const DetallePedido = require('../../domain/entities/DetallePedido');

/**
 * Caso de uso: Crear Pedido
 */
class CrearPedidoUseCase {
  constructor(pedidoRepository, productoRepository, eventPublisher) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
    this.eventPublisher = eventPublisher;
  }

  async execute(data) {
    // Validar datos requeridos
    if (!data.usuario_id) {
      throw new Error('El usuario_id es requerido');
    }

    if (!data.productos || data.productos.length === 0) {
      throw new Error('Debe incluir al menos un producto');
    }

    // Crear pedido
    const pedido = new Pedido(
      null,
      data.cliente_id || null,
      data.usuario_id,
      'pendiente',
      0,
      new Date()
    );

    // Crear detalles del pedido
    const detalles = [];
    let totalPedido = 0;

    for (const item of data.productos) {
      // Obtener producto para obtener precio actual
      const producto = await this.productoRepository.findById(item.producto_id);
      
      if (!producto) {
        throw new Error(`Producto con id ${item.producto_id} no encontrado`);
      }

      if (!producto.disponibilidad) {
        throw new Error(`Producto ${producto.nombre} no está disponible`);
      }

      const cantidad = item.cantidad;
      const precioUnitario = producto.precio;
      const subtotal = cantidad * precioUnitario;

      const detalle = new DetallePedido(
        null,
        null, // Se asignará después de crear el pedido
        item.producto_id,
        cantidad,
        precioUnitario,
        subtotal
      );

      detalles.push(detalle);
      totalPedido += subtotal;
    }

    pedido.total = totalPedido;
    pedido.detalles = detalles;

    // Persistir pedido con detalles
    const pedidoCreado = await this.pedidoRepository.save(pedido, detalles);

    // Publicar evento de dominio
    if (this.eventPublisher) {
      await this.eventPublisher.publish('pedido_creado', {
        pedidoId: pedidoCreado.id,
        estado: pedidoCreado.estado,
        total: pedidoCreado.total,
        cantidadProductos: detalles.length,
        timestamp: new Date().toISOString(),
      });
    }

    return pedidoCreado;
  }
}

module.exports = CrearPedidoUseCase;
