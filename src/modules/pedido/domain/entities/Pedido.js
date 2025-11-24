class Pedido {
  constructor(id, clienteId, usuarioId, estado, total, fechaHora) {
    this.id = id;
    this.clienteId = clienteId;
    this.usuarioId = usuarioId;
    this.estado = estado || 'pendiente';
    this.total = total || 0;
    this.fechaHora = fechaHora || new Date();
    this.detalles = [];
  }

  agregarDetalle(detalle) {
    this.detalles.push(detalle);
    this.recalcularTotal();
  }

  recalcularTotal() {
    this.total = this.detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
  }

  cambiarEstado(nuevoEstado) {
    const estadosValidos = ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(nuevoEstado)) {
      throw new Error(`Estado inválido: ${nuevoEstado}`);
    }
    this.estado = nuevoEstado;
  }

  static fromPrimitives(data) {
    return new Pedido(
      data.id,
      data.cliente_id,
      data.usuario_id,
      data.estado,
      parseFloat(data.total),
      data.fecha_hora
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      cliente_id: this.clienteId,
      usuario_id: this.usuarioId,
      estado: this.estado,
      total: this.total,
      fecha_hora: this.fechaHora,
      detalles: this.detalles.map(d => d.toPrimitives())
    };
  }
}

module.exports = Pedido;
