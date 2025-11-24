const PedidoRepository = require('../../domain/ports/PedidoRepository');
const Pedido = require('../../domain/entities/Pedido');
const DetallePedido = require('../../domain/entities/DetallePedido');

/**
 * Adaptador de persistencia para PostgreSQL
 * Implementa el puerto PedidoRepository
 */
class PostgresPedidoRepository extends PedidoRepository {
  constructor(postgresClient) {
    super();
    this.client = postgresClient;
  }

  async findById(id) {
    // Obtener pedido
    const pedidoResult = await this.client.query(
      'SELECT * FROM pedido WHERE id = $1',
      [id]
    );

    if (pedidoResult.rows.length === 0) {
      return null;
    }

    const pedido = Pedido.fromPrimitives(pedidoResult.rows[0]);

    // Obtener detalles del pedido
    const detallesResult = await this.client.query(
      `SELECT dp.*, p.nombre as producto_nombre 
       FROM detalle_pedido dp
       JOIN producto p ON dp.producto_id = p.id
       WHERE dp.pedido_id = $1`,
      [id]
    );

    pedido.detalles = detallesResult.rows.map(row => {
      const detalle = DetallePedido.fromPrimitives(row);
      detalle.productoNombre = row.producto_nombre;
      return detalle;
    });

    return pedido;
  }

  async findAll() {
    const result = await this.client.query(
      `SELECT p.*, 
              c.nombre as cliente_nombre,
              u.nombre as usuario_nombre
       FROM pedido p
       LEFT JOIN cliente c ON p.cliente_id = c.id
       LEFT JOIN usuario u ON p.usuario_id = u.id
       ORDER BY p.fecha_hora DESC`
    );
    
    return result.rows.map(row => {
      const pedido = Pedido.fromPrimitives(row);
      pedido.clienteNombre = row.cliente_nombre;
      pedido.usuarioNombre = row.usuario_nombre;
      return pedido;
    });
  }

  async findByEstado(estado) {
    const result = await this.client.query(
      `SELECT p.*, 
              c.nombre as cliente_nombre,
              u.nombre as usuario_nombre
       FROM pedido p
       LEFT JOIN cliente c ON p.cliente_id = c.id
       LEFT JOIN usuario u ON p.usuario_id = u.id
       WHERE p.estado = $1
       ORDER BY p.fecha_hora ASC`,
      [estado]
    );
    
    return result.rows.map(row => {
      const pedido = Pedido.fromPrimitives(row);
      pedido.clienteNombre = row.cliente_nombre;
      pedido.usuarioNombre = row.usuario_nombre;
      return pedido;
    });
  }

  async save(pedido, detalles) {
    // Usar transacción para asegurar consistencia
    const client = await this.client.pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Crear pedido
      const pedidoResult = await client.query(
        `INSERT INTO pedido (cliente_id, usuario_id, estado, total)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          pedido.clienteId,
          pedido.usuarioId,
          pedido.estado,
          pedido.total
        ]
      );

      const pedidoCreado = Pedido.fromPrimitives(pedidoResult.rows[0]);

      // 2. Crear detalles del pedido
      for (const detalle of detalles) {
        await client.query(
          `INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            pedidoCreado.id,
            detalle.productoId,
            detalle.cantidad,
            detalle.precioUnitario,
            detalle.subtotal
          ]
        );
      }

      await client.query('COMMIT');
      
      // Retornar el pedido completo con detalles
      return await this.findById(pedidoCreado.id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(pedido) {
    const result = await this.client.query(
      `UPDATE pedido 
       SET estado = $1, total = $2
       WHERE id = $3
       RETURNING *`,
      [pedido.estado, pedido.total, pedido.id]
    );

    if (result.rows.length === 0) {
      throw new Error(`Pedido con id ${pedido.id} no encontrado`);
    }

    return Pedido.fromPrimitives(result.rows[0]);
  }

  async delete(id) {
    const result = await this.client.query(
      'DELETE FROM pedido WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error(`Pedido con id ${id} no encontrado`);
    }
  }
}

module.exports = PostgresPedidoRepository;
