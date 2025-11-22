class ActualizarProductoUseCase {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async execute(id, data) {
    // Obtener producto existente
    const producto = await this.productoRepository.findById(id);
    
    if (!producto) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }

    // Aplicar cambios con lógica de dominio
    if (data.nombre !== undefined) {
      producto.nombre = data.nombre;
    }
    
    if (data.precio !== undefined) {
      producto.actualizarPrecio(data.precio);
    }
    
    if (data.categoria !== undefined) {
      producto.categoria = data.categoria;
    }
    
    if (data.disponibilidad !== undefined) {
      producto.cambiarDisponibilidad(data.disponibilidad);
    }
    
    if (data.tiempo_preparacion_estimado !== undefined) {
      producto.tiempoPreparacionEstimado = data.tiempo_preparacion_estimado;
    }

    // Persistir cambios
    return await this.productoRepository.update(producto);
  }
}

module.exports = ActualizarProductoUseCase;
