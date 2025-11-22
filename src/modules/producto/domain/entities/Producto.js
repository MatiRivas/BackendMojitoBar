class Producto {
  constructor(id, nombre, precio, categoria, disponibilidad, tiempoPreparacionEstimado) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.categoria = categoria;
    this.disponibilidad = disponibilidad;
    this.tiempoPreparacionEstimado = tiempoPreparacionEstimado;
  }

  cambiarDisponibilidad(nuevaDisponibilidad) {
    this.disponibilidad = nuevaDisponibilidad;
  }

  actualizarPrecio(nuevoPrecio) {
    if (nuevoPrecio <= 0) {
      throw new Error('El precio debe ser mayor a cero');
    }
    this.precio = nuevoPrecio;
  }

  esDisponible() {
    return this.disponibilidad === true;
  }

  static fromPrimitives(data) {
    return new Producto(
      data.id,
      data.nombre,
      data.precio,
      data.categoria,
      data.disponibilidad,
      data.tiempo_preparacion_estimado
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      nombre: this.nombre,
      precio: this.precio,
      categoria: this.categoria,
      disponibilidad: this.disponibilidad,
      tiempo_preparacion_estimado: this.tiempoPreparacionEstimado,
    };
  }
}

module.exports = Producto;
