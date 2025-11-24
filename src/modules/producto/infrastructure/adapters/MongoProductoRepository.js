const { ObjectId } = require('mongodb');
const ProductoRepository = require('../../domain/ports/ProductoRepository');
const Producto = require('../../domain/entities/Producto');

/**
 * Adaptador de persistencia para MongoDB
 * Implementa el puerto ProductoRepository
 * 
 * Estructura embebida del documento:
 * {
 *   _id: ObjectId,
 *   nombre: string,
 *   precio: number,
 *   categoria: string,
 *   disponibilidad: boolean,
 *   tiempoPreparacionEstimado: number,
 *   descripcion: string,
 *   imagenUrl: string,
 *   ingredientes: [
 *     {
 *       id: ObjectId,
 *       nombre: string,
 *       cantidadNecesaria: number,
 *       unidad: string
 *     }
 *   ],
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */
class MongoProductoRepository extends ProductoRepository {
  constructor(mongoClient) {
    super();
    this.db = mongoClient.getDb();
    this.collection = this.db.collection('productos');
  }

  async findById(id) {
    // Validar que sea un ObjectId válido
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

  async save(producto) {
    const primitives = producto.toPrimitives();
    
    const doc = {
      nombre: primitives.nombre,
      precio: primitives.precio,
      categoria: primitives.categoria,
      disponibilidad: primitives.disponibilidad,
      tiempoPreparacionEstimado: primitives.tiempo_preparacion_estimado,
      descripcion: primitives.descripcion || '',
      imagenUrl: primitives.imagen_url || '',
      ingredientes: [], // Se actualizarán después si es necesario
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection.insertOne(doc);
    doc._id = result.insertedId;
    
    return this._documentToEntity(doc);
  }

  async update(producto) {
    const primitives = producto.toPrimitives();
    
    if (!ObjectId.isValid(primitives.id)) {
      throw new Error(`Producto con id ${producto.id} no encontrado`);
    }
    
    const updateDoc = {
      $set: {
        nombre: primitives.nombre,
        precio: primitives.precio,
        categoria: primitives.categoria,
        disponibilidad: primitives.disponibilidad,
        tiempoPreparacionEstimado: primitives.tiempo_preparacion_estimado,
        updatedAt: new Date()
      }
    };

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(primitives.id) },
      updateDoc,
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error(`Producto con id ${producto.id} no encontrado`);
    }

    return this._documentToEntity(result);
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }
    
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }
  }

  /**
   * Actualizar ingredientes del producto (receta embebida)
   */
  async updateIngredientes(productoId, ingredientes) {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(productoId) },
      { 
        $set: { 
          ingredientes: ingredientes,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error(`Producto con id ${productoId} no encontrado`);
    }

    return this._documentToEntity(result);
  }

  /**
   * Convertir documento MongoDB a entidad del dominio
   */
  _documentToEntity(doc) {
    return Producto.fromPrimitives({
      id: doc._id.toString(),
      nombre: doc.nombre,
      precio: doc.precio,
      categoria: doc.categoria,
      disponibilidad: doc.disponibilidad,
      tiempo_preparacion_estimado: doc.tiempoPreparacionEstimado,
      descripcion: doc.descripcion,
      imagen_url: doc.imagenUrl,
      created_at: doc.createdAt,
      updated_at: doc.updatedAt
    });
  }
}

module.exports = MongoProductoRepository;
