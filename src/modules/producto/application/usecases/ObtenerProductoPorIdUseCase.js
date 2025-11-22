class ObtenerProductoPorIdUseCase {
  constructor(productoRepository) {
    this.productoRepository = productoRepository;
  }

  async execute(id) {
    const producto = await this.productoRepository.findById(id);
    
    if (!producto) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }

    return producto;
  }
}

module.exports = ObtenerProductoPorIdUseCase;
