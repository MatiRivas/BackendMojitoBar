const Producto = require('../../domain/entities/Producto');

class CrearProductoUseCase {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async execute(data) {
    // Validaciones de negocio
    if (!data.nombre || data.nombre.trim() === '') {
      throw new Error('El nombre del producto es requerido');
    }

    if (!data.precio || data.precio <= 0) {
      throw new Error('El precio debe ser mayor a cero');
    }

    // Crear entidad de dominio
    const producto = new Producto(
      null, // El id será asignado por la BD
      data.nombre,
      data.precio,
      data.categoria,
      data.disponibilidad !== undefined ? data.disponibilidad : true,
      data.tiempo_preparacion_estimado || 0
    );

    // Persistir
    return await this.productoRepository.save(producto);
  }
}

module.exports = CrearProductoUseCase;
