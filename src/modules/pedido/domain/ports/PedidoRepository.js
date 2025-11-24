/**
 * Puerto (Interface) - PedidoRepository
 * Define el contrato para persistencia de pedidos
 */
class PedidoRepository {
  async findById(id) {
    throw new Error('Método findById() debe ser implementado');
  }

  async findAll() {
    throw new Error('Método findAll() debe ser implementado');
  }

  async findByEstado(estado) {
    throw new Error('Método findByEstado() debe ser implementado');
  }

  async save(pedido, detalles) {
    throw new Error('Método save() debe ser implementado');
  }

  async update(pedido) {
    throw new Error('Método update() debe ser implementado');
  }

  async delete(id) {
    throw new Error('Método delete() debe ser implementado');
  }
}

module.exports = PedidoRepository;
