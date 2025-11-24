const { ObjectId } = require('mongodb');
const InventarioRepository = require('../../domain/ports/InventarioRepository');
const Inventario = require('../../domain/entities/Inventario');

/**
 * Adaptador de persistencia para MongoDB
 * Implementa el puerto InventarioRepository
 * 
 * Estructura del documento:
 * {
 *   _id: ObjectId,
 *   nombre: string,
 *   cantidadDisponible: number,
 *   unidad: string,
 *   tipo: string,
 *   stockMinimo: number,
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */
class MongoInventarioRepository extends InventarioRepository {
  constructor(mongoClient) {
    super();
    this.db = mongoClient.getDb();
    this.collection = this.db.collection('inventario');
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
    const docs = await this.collection.find({}).toArray();
    return docs.map(doc => this._documentToEntity(doc));
  }

  async save(inventario) {
    const primitives = inventario.toPrimitives();
    
    const doc = {
      nombre: primitives.nombre,
      cantidadDisponible: primitives.cantidad_disponible,
      unidad: primitives.unidad,
      tipo: primitives.tipo || '',
      stockMinimo: primitives.stock_minimo || 10,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection.insertOne(doc);
    doc._id = result.insertedId;
    
    return this._documentToEntity(doc);
  }

  async update(inventario) {
    const primitives = inventario.toPrimitives();
    
    if (!ObjectId.isValid(primitives.id)) {
      throw new Error(`Inventario con id ${inventario.id} no encontrado`);
    }
    
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(primitives.id) },
      { 
        $set: {
          cantidadDisponible: primitives.cantidad_disponible,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error(`Inventario con id ${inventario.id} no encontrado`);
    }

    return this._documentToEntity(result);
  }

  /**
   * Reducir inventario por cantidad (útil para pedidos)
   */
  async reduceStock(id, cantidad) {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $inc: { cantidadDisponible: -cantidad },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error(`Inventario con id ${id} no encontrado`);
    }

    return this._documentToEntity(result);
  }

  /**
   * Obtener inventario bajo stock
   */
  async findLowStock() {
    const docs = await this.collection.find({
      $expr: { $lt: ['$cantidadDisponible', '$stockMinimo'] }
    }).toArray();
    
    return docs.map(doc => this._documentToEntity(doc));
  }

  /**
   * Convertir documento MongoDB a entidad del dominio
   */
  _documentToEntity(doc) {
    return Inventario.fromPrimitives({
      id: doc._id.toString(),
      nombre: doc.nombre,
      cantidad_disponible: doc.cantidadDisponible,
      unidad: doc.unidad,
      tipo: doc.tipo,
      stock_minimo: doc.stockMinimo,
      created_at: doc.createdAt,
      updated_at: doc.updatedAt
    });
  }
}

module.exports = MongoInventarioRepository;
