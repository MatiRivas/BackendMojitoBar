const ProductoRepository = require('../../domain/ports/ProductoRepository');
const Producto = require('../../domain/entities/Producto');

/**
 * Adaptador de persistencia para PostgreSQL
 * Implementa el puerto ProductoRepository
 */
class PostgresProductoRepository extends ProductoRepository {
  constructor(postgresClient) {
    super();
    this.client = postgresClient;
  }

  async findById(id) {
    const result = await this.client.query(
      'SELECT * FROM producto WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return Producto.fromPrimitives(result.rows[0]);
  }

  async findAll() {
    const result = await this.client.query('SELECT * FROM producto');
    return result.rows.map(row => Producto.fromPrimitives(row));
  }

  async save(producto) {
    const primitives = producto.toPrimitives();
    const result = await this.client.query(
      `INSERT INTO producto (nombre, precio, categoria, disponibilidad, tiempo_preparacion_estimado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        primitives.nombre,
        primitives.precio,
        primitives.categoria,
        primitives.disponibilidad,
        primitives.tiempo_preparacion_estimado
      ]
    );

    return Producto.fromPrimitives(result.rows[0]);
  }

  async update(producto) {
    const primitives = producto.toPrimitives();
    const result = await this.client.query(
      `UPDATE producto 
       SET nombre = $1, precio = $2, categoria = $3, disponibilidad = $4, tiempo_preparacion_estimado = $5
       WHERE id = $6
       RETURNING *`,
      [
        primitives.nombre,
        primitives.precio,
        primitives.categoria,
        primitives.disponibilidad,
        primitives.tiempo_preparacion_estimado,
        primitives.id
      ]
    );

    if (result.rows.length === 0) {
      throw new Error(`Producto con id ${producto.id} no encontrado`);
    }

    return Producto.fromPrimitives(result.rows[0]);
  }

  async delete(id) {
    const result = await this.client.query(
      'DELETE FROM producto WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }
  }
}

module.exports = PostgresProductoRepository;
