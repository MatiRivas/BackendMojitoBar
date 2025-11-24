const { ObjectId } = require('mongodb');
const PedidoRepository = require('../../domain/ports/PedidoRepository');
const Pedido = require('../../domain/entities/Pedido');
const DetallePedido = require('../../domain/entities/DetallePedido');

/**
 * Adaptador de persistencia para MongoDB
 * Implementa el puerto PedidoRepository
 * 
 * Estructura embebida del documento (todo en un solo documento):
 * {
 *   _id: ObjectId,
 *   cliente: {
 *     id: ObjectId,
 *     nombre: string,
 *     email: string,
 *     telefono: string
 *   },
 *   usuario: {
 *     id: ObjectId,
 *     nombre: string,
 *     rol: string
 *   },
 *   estado: string,
 *   total: number,
 *   fechaHora: Date,
 *   detalles: [
 *     {
 *       productoId: ObjectId,
 *       productoNombre: string,
 *       cantidad: number,
 *       precioUnitario: number,
 *       subtotal: number
 *     }
 *   ],
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */
class MongoPedidoRepository extends PedidoRepository {
  constructor(mongoClient) {
    super();
    this.db = mongoClient.getDb();
    this.collection = this.db.collection('pedidos');
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) {
      return null;
    }
    
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
    
    if (!doc) {
      return null;
    }

    return this._documentToEntity(doc);
  }

  async findAll() {
    const docs = await this.collection
      .find({})
      .sort({ fechaHora: -1 })
      .toArray();
    
    return docs.map(doc => this._documentToEntity(doc));
  }

  async findByEstado(estado) {
    const docs = await this.collection
      .find({ estado })
      .sort({ fechaHora: 1 })
      .toArray();
    
    return docs.map(doc => this._documentToEntity(doc));
  }

  async save(pedido, detalles) {
    // Crear documento embebido con toda la información
    const doc = {
      cliente: pedido.clienteId ? {
        id: new ObjectId(pedido.clienteId)
        // El nombre, email, telefono se agregarán al migrar
      } : null,
      usuario: {
        id: new ObjectId(pedido.usuarioId)
        // El nombre y rol se agregarán al migrar
      },
      estado: pedido.estado,
      total: pedido.total,
      fechaHora: new Date(),
      detalles: detalles.map(detalle => ({
        productoId: new ObjectId(detalle.productoId),
        productoNombre: detalle.productoNombre || '',
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        subtotal: detalle.subtotal
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection.insertOne(doc);
    doc._id = result.insertedId;
    
    return this._documentToEntity(doc);
  }

  async update(pedido) {
    if (!ObjectId.isValid(pedido.id)) {
      throw new Error(`Pedido con id ${pedido.id} no encontrado`);
    }
    
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(pedido.id) },
      { 
        $set: {
          estado: pedido.estado,
          total: pedido.total,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error(`Pedido con id ${pedido.id} no encontrado`);
    }

    return this._documentToEntity(result);
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error(`Pedido con id ${id} no encontrado`);
    }
    
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new Error(`Pedido con id ${id} no encontrado`);
    }
  }

  /**
   * Agregar detalle a un pedido existente
   */
  async addDetalle(pedidoId, detalle) {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(pedidoId) },
      { 
        $push: {
          detalles: {
            productoId: new ObjectId(detalle.productoId),
            productoNombre: detalle.productoNombre,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            subtotal: detalle.subtotal
          }
        },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error(`Pedido con id ${pedidoId} no encontrado`);
    }

    return this._documentToEntity(result);
  }

  /**
   * Obtener pedidos por cliente
   */
  async findByCliente(clienteId) {
    const docs = await this.collection
      .find({ 'cliente.id': new ObjectId(clienteId) })
      .sort({ fechaHora: -1 })
      .toArray();
    
    return docs.map(doc => this._documentToEntity(doc));
  }

  /**
   * Obtener pedidos por usuario (mesero/bartender)
   */
  async findByUsuario(usuarioId) {
    const docs = await this.collection
      .find({ 'usuario.id': new ObjectId(usuarioId) })
      .sort({ fechaHora: -1 })
      .toArray();
    
    return docs.map(doc => this._documentToEntity(doc));
  }

  /**
   * Convertir documento MongoDB a entidad del dominio
   */
  _documentToEntity(doc) {
    const pedido = Pedido.fromPrimitives({
      id: doc._id.toString(),
      cliente_id: doc.cliente?.id.toString(),
      usuario_id: doc.usuario.id.toString(),
      estado: doc.estado,
      total: doc.total,
      fecha_hora: doc.fechaHora,
      created_at: doc.createdAt,
      updated_at: doc.updatedAt
    });

    // Agregar información adicional embebida
    if (doc.cliente) {
      pedido.clienteNombre = doc.cliente.nombre;
      pedido.clienteEmail = doc.cliente.email;
    }
    
    if (doc.usuario) {
      pedido.usuarioNombre = doc.usuario.nombre;
      pedido.usuarioRol = doc.usuario.rol;
    }

    // Agregar detalles embebidos
    if (doc.detalles && doc.detalles.length > 0) {
      pedido.detalles = doc.detalles.map(detalle => {
        const detallePedido = DetallePedido.fromPrimitives({
          id: detalle._id?.toString(),
          pedido_id: doc._id.toString(),
          producto_id: detalle.productoId.toString(),
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precioUnitario,
          subtotal: detalle.subtotal
        });
        detallePedido.productoNombre = detalle.productoNombre;
        return detallePedido;
      });
    }

    return pedido;
  }
}

module.exports = MongoPedidoRepository;
