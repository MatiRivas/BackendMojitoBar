/**
 * Caso de uso: Obtener Inventario
 */
class ObtenerInventarioUseCase {
  constructor(inventarioRepository) {
    this.inventarioRepository = inventarioRepository;
  }

  async execute(inventarioId) {
    const inventario = await this.inventarioRepository.findById(inventarioId);
    
    if (!inventario) {
      throw new Error(`Inventario con id ${inventarioId} no encontrado`);
    }

    return inventario;
  }
}

module.exports = ObtenerInventarioUseCase;
