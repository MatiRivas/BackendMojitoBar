class Inventario {
  constructor(id, nombre, cantidadDisponible, unidad, tipo, stockMinimo, ubicacion) {
    this.id = id;
    this.nombre = nombre;
    this.cantidadDisponible = cantidadDisponible;
    this.unidad = unidad;
    this.tipo = tipo;
    this.stockMinimo = stockMinimo;
    this.ubicacion = ubicacion;
  }

  actualizarCantidad(nuevaCantidad) {
    if (nuevaCantidad < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }
    this.cantidadDisponible = nuevaCantidad;
  }

  esBajoStock() {
    return this.cantidadDisponible < this.stockMinimo;
  }

  static fromPrimitives(data) {
    return new Inventario(
      data.id,
      data.nombre,
      parseFloat(data.cantidad_disponible),
      data.unidad,
      data.tipo,
      parseFloat(data.stock_minimo),
      data.ubicacion
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      nombre: this.nombre,
      cantidad_disponible: this.cantidadDisponible,
      unidad: this.unidad,
      tipo: this.tipo,
      stock_minimo: this.stockMinimo,
      ubicacion: this.ubicacion,
    };
  }
}

module.exports = Inventario;
