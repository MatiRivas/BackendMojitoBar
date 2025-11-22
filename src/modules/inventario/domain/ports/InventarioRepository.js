/**
 * Puerto (Interface) para el repositorio de Inventario
 * Define el contrato que deben cumplir los adaptadores de persistencia
 */
class InventarioRepository {
  async findById(id) {
    throw new Error('Method not implemented');
  }

  async save(inventario) {
    throw new Error('Method not implemented');
  }

  async update(inventario) {
    throw new Error('Method not implemented');
  }

  async findAll() {
    throw new Error('Method not implemented');
  }
}

module.exports = InventarioRepository;
