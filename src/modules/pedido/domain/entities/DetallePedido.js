class DetallePedido {
  constructor(id, pedidoId, productoId, cantidad, precioUnitario, subtotal) {
    this.id = id;
    this.pedidoId = pedidoId;
    this.productoId = productoId;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
    this.subtotal = subtotal || (cantidad * precioUnitario);
  }

  static fromPrimitives(data) {
    return new DetallePedido(
      data.id,
      data.pedido_id,
      data.producto_id,
      parseInt(data.cantidad),
      parseFloat(data.precio_unitario),
      parseFloat(data.subtotal)
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      pedido_id: this.pedidoId,
      producto_id: this.productoId,
      cantidad: this.cantidad,
      precio_unitario: this.precioUnitario,
      subtotal: this.subtotal
    };
  }
}

module.exports = DetallePedido;
