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
      `INSERT INTO inventario (nombre, cantidad_disponible, unidad, tipo, stock_minimo, ubicacion)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        primitives.nombre,
        primitives.cantidad_disponible,
        primitives.unidad,
        primitives.tipo,
        primitives.stock_minimo,
        primitives.ubicacion
      ]
    );

    return Inventario.fromPrimitives(result.rows[0]);
  }

  async update(inventario) {
    const primitives = inventario.toPrimitives();
    const result = await this.client.query(
      `UPDATE inventario 
       SET cantidad_disponible = $1
       WHERE id = $2
       RETURNING *`,
      [primitives.cantidad_disponible, primitives.id]
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
