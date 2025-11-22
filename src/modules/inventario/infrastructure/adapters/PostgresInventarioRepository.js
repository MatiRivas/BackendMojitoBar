const InventarioRepository = require('../../domain/ports/InventarioRepository');
const Inventario = require('../../domain/entities/Inventario');

/**
 * Adaptador de persistencia para PostgreSQL
 * Implementa el puerto InventarioRepository
 */
class PostgresInventarioRepository extends InventarioRepository {
  constructor(postgresClient) {
    super();
    this.client = postgresClient;
  }

  async findById(id) {
    const result = await this.client.query(
      'SELECT * FROM inventario WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return Inventario.fromPrimitives(result.rows[0]);
  }

  async save(inventario) {
    const primitives = inventario.toPrimitives();
    const result = await this.client.query(
      `INSERT INTO inventario (producto_id, cantidad, ubicacion, fecha_actualizacion)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [primitives.producto_id, primitives.cantidad, primitives.ubicacion, primitives.fecha_actualizacion]
    );

    return Inventario.fromPrimitives(result.rows[0]);
  }

  async update(inventario) {
    const primitives = inventario.toPrimitives();
    const result = await this.client.query(
      `UPDATE inventario 
       SET cantidad = $1, fecha_actualizacion = $2
       WHERE id = $3
       RETURNING *`,
      [primitives.cantidad, primitives.fecha_actualizacion, primitives.id]
    );

    if (result.rows.length === 0) {
      throw new Error(`Inventario con id ${inventario.id} no encontrado`);
    }

    return Inventario.fromPrimitives(result.rows[0]);
  }

  async findAll() {
    const result = await this.client.query('SELECT * FROM inventario');
    return result.rows.map(row => Inventario.fromPrimitives(row));
  }
}

module.exports = PostgresInventarioRepository;
