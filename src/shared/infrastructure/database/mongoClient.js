const { MongoClient } = require('mongodb');

/**
 * Cliente compartido de MongoDB
 * Infraestructura compartida entre módulos
 */
class MongoDBClient {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    if (this.client) {
      return this.db;
    }

    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGO_DB || 'mojitobar';

    try {
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db(dbName);
      
      console.log('✅ Conectado a MongoDB:', dbName);
      
      // Crear índices
      await this.createIndexes();
      
      return this.db;
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Índices para clientes
      await this.db.collection('clientes').createIndex({ email: 1 }, { unique: true, sparse: true });
      
      // Índices para usuarios
      await this.db.collection('usuarios').createIndex({ email: 1 }, { unique: true });
      await this.db.collection('usuarios').createIndex({ rol: 1 });
      
      // Índices para productos
      await this.db.collection('productos').createIndex({ nombre: 1 });
      await this.db.collection('productos').createIndex({ categoria: 1 });
      await this.db.collection('productos').createIndex({ disponibilidad: 1 });
      
      // Índices para inventario
      await this.db.collection('inventario').createIndex({ nombre: 1 });
      await this.db.collection('inventario').createIndex({ tipo: 1 });
      
      // Índices para pedidos
      await this.db.collection('pedidos').createIndex({ 'cliente.id': 1 });
      await this.db.collection('pedidos').createIndex({ 'usuario.id': 1 });
      await this.db.collection('pedidos').createIndex({ estado: 1 });
      await this.db.collection('pedidos').createIndex({ fechaHora: -1 });
      
      console.log('✅ Índices de MongoDB creados');
    } catch (error) {
      console.error('⚠️  Error creando índices:', error.message);
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error('Base de datos no conectada. Llama a connect() primero.');
    }
    return this.db;
  }

  async close() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('🔌 Conexión a MongoDB cerrada');
    }
  }
}

// Singleton
const mongoClient = new MongoDBClient();

module.exports = mongoClient;
