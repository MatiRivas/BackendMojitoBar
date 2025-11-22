class Inventario {
  constructor(id, productoId, cantidad, ubicacion, fechaActualizacion = new Date()) {
    this.id = id;
    this.productoId = productoId;
    this.cantidad = cantidad;
    this.ubicacion = ubicacion;
    this.fechaActualizacion = fechaActualizacion;
  }

  actualizarCantidad(nuevaCantidad) {
    if (nuevaCantidad < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }
    this.cantidad = nuevaCantidad;
    this.fechaActualizacion = new Date();
  }

  esBajoStock(minimoStock = 10) {
    return this.cantidad < minimoStock;
  }

  static fromPrimitives(data) {
    return new Inventario(
      data.id,
      data.producto_id,
      data.cantidad,
      data.ubicacion,
      data.fecha_actualizacion
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      producto_id: this.productoId,
      cantidad: this.cantidad,
      ubicacion: this.ubicacion,
      fecha_actualizacion: this.fechaActualizacion,
    };
  }
}

module.exports = Inventario;
