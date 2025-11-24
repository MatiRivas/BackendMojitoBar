#!/usr/bin/env node

/**
 * Script de migración de PostgreSQL a MongoDB
 * 
 * Este script:
 * 1. Se conecta a PostgreSQL y MongoDB
 * 2. Lee todos los datos de PostgreSQL
 * 3. Los transforma al formato embebido de MongoDB
 * 4. Los inserta en MongoDB
 * 
 * Uso: node database/migrate-postgres-to-mongo.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const { MongoClient, ObjectId } = require('mongodb');

// Configuración PostgreSQL
const pgPool = new Pool({
  user: process.env.PG_USER || 'chupacarrillo',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DB || 'llm',
  password: process.env.PG_PASSWORD || '',
  port: process.env.PG_PORT || 5432,
});

// Configuración MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGO_DB || 'mojitobar';

// Mapeo de IDs PostgreSQL a MongoDB
const idMap = {
  clientes: new Map(),
  usuarios: new Map(),
  productos: new Map(),
  inventario: new Map(),
  pedidos: new Map()
};

async function migrateClientes(pgClient, mongoDb) {
  console.log('\n📋 Migrando CLIENTES...');
  
  const result = await pgClient.query('SELECT * FROM cliente ORDER BY id');
  const clientes = result.rows;
  
  if (clientes.length === 0) {
    console.log('   ⚠️  No hay clientes para migrar');
    return;
  }

  const clientesCollection = mongoDb.collection('clientes');
  
  for (const cliente of clientes) {
    const doc = {
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      createdAt: cliente.created_at,
      updatedAt: cliente.updated_at
    };
    
    const insertResult = await clientesCollection.insertOne(doc);
    idMap.clientes.set(cliente.id, insertResult.insertedId);
  }
  
  console.log(`   ✅ ${clientes.length} clientes migrados`);
}

async function migrateUsuarios(pgClient, mongoDb) {
  console.log('\n👥 Migrando USUARIOS...');
  
  const result = await pgClient.query('SELECT * FROM usuario ORDER BY id');
  const usuarios = result.rows;
  
  if (usuarios.length === 0) {
    console.log('   ⚠️  No hay usuarios para migrar');
    return;
  }

  const usuariosCollection = mongoDb.collection('usuarios');
  
  for (const usuario of usuarios) {
    const doc = {
      nombre: usuario.nombre,
      email: usuario.email,
      clave: usuario.clave,
      rol: usuario.rol,
      activo: usuario.activo,
      createdAt: usuario.created_at,
      updatedAt: usuario.updated_at
    };
    
    const insertResult = await usuariosCollection.insertOne(doc);
    idMap.usuarios.set(usuario.id, insertResult.insertedId);
  }
  
  console.log(`   ✅ ${usuarios.length} usuarios migrados`);
}

async function migrateInventario(pgClient, mongoDb) {
  console.log('\n📦 Migrando INVENTARIO...');
  
  const result = await pgClient.query('SELECT * FROM inventario ORDER BY id');
  const inventario = result.rows;
  
  if (inventario.length === 0) {
    console.log('   ⚠️  No hay inventario para migrar');
    return;
  }

  const inventarioCollection = mongoDb.collection('inventario');
  
  for (const item of inventario) {
    const doc = {
      nombre: item.nombre,
      cantidadDisponible: parseFloat(item.cantidad_disponible),
      unidad: item.unidad,
      tipo: item.tipo,
      stockMinimo: parseFloat(item.stock_minimo),
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
    
    const insertResult = await inventarioCollection.insertOne(doc);
    idMap.inventario.set(item.id, insertResult.insertedId);
  }
  
  console.log(`   ✅ ${inventario.length} items de inventario migrados`);
}

async function migrateProductos(pgClient, mongoDb) {
  console.log('\n🍹 Migrando PRODUCTOS (con ingredientes embebidos)...');
  
  const result = await pgClient.query('SELECT * FROM producto ORDER BY id');
  const productos = result.rows;
  
  if (productos.length === 0) {
    console.log('   ⚠️  No hay productos para migrar');
    return;
  }

  const productosCollection = mongoDb.collection('productos');
  
  for (const producto of productos) {
    // Obtener ingredientes del producto
    const ingredientesResult = await pgClient.query(
      `SELECT dpi.*, i.nombre, i.unidad 
       FROM detalle_producto_inventario dpi
       JOIN inventario i ON dpi.inventario_id = i.id
       WHERE dpi.producto_id = $1`,
      [producto.id]
    );
    
    const ingredientes = ingredientesResult.rows.map(ing => ({
      id: idMap.inventario.get(ing.inventario_id),
      nombre: ing.nombre,
      cantidadNecesaria: parseFloat(ing.cantidad_necesaria),
      unidad: ing.unidad
    }));
    
    const doc = {
      nombre: producto.nombre,
      precio: parseFloat(producto.precio),
      categoria: producto.categoria,
      disponibilidad: producto.disponibilidad,
      tiempoPreparacionEstimado: producto.tiempo_preparacion_estimado || 0,
      descripcion: producto.descripcion || '',
      imagenUrl: producto.imagen_url || '',
      ingredientes: ingredientes, // EMBEBIDO
      createdAt: producto.created_at,
      updatedAt: producto.updated_at
    };
    
    const insertResult = await productosCollection.insertOne(doc);
    idMap.productos.set(producto.id, insertResult.insertedId);
  }
  
  console.log(`   ✅ ${productos.length} productos migrados (con ingredientes embebidos)`);
}

async function migratePedidos(pgClient, mongoDb) {
  console.log('\n🧾 Migrando PEDIDOS (con detalles embebidos)...');
  
  const result = await pgClient.query(`
    SELECT p.*, 
           c.nombre as cliente_nombre, c.email as cliente_email, c.telefono as cliente_telefono,
           u.nombre as usuario_nombre, u.rol as usuario_rol
    FROM pedido p
    LEFT JOIN cliente c ON p.cliente_id = c.id
    LEFT JOIN usuario u ON p.usuario_id = u.id
    ORDER BY p.id
  `);
  
  const pedidos = result.rows;
  
  if (pedidos.length === 0) {
    console.log('   ⚠️  No hay pedidos para migrar');
    return;
  }

  const pedidosCollection = mongoDb.collection('pedidos');
  
  for (const pedido of pedidos) {
    // Obtener detalles del pedido
    const detallesResult = await pgClient.query(
      `SELECT dp.*, p.nombre as producto_nombre
       FROM detalle_pedido dp
       JOIN producto p ON dp.producto_id = p.id
       WHERE dp.pedido_id = $1`,
      [pedido.id]
    );
    
    const detalles = detallesResult.rows.map(det => ({
      productoId: idMap.productos.get(det.producto_id),
      productoNombre: det.producto_nombre,
      cantidad: det.cantidad,
      precioUnitario: parseFloat(det.precio_unitario),
      subtotal: parseFloat(det.subtotal)
    }));
    
    const doc = {
      cliente: pedido.cliente_id ? {
        id: idMap.clientes.get(pedido.cliente_id),
        nombre: pedido.cliente_nombre,
        email: pedido.cliente_email,
        telefono: pedido.cliente_telefono
      } : null,
      usuario: {
        id: idMap.usuarios.get(pedido.usuario_id),
        nombre: pedido.usuario_nombre,
        rol: pedido.usuario_rol
      },
      estado: pedido.estado,
      total: parseFloat(pedido.total),
      fechaHora: pedido.fecha_hora,
      detalles: detalles, // EMBEBIDO
      createdAt: pedido.created_at,
      updatedAt: pedido.updated_at
    };
    
    const insertResult = await pedidosCollection.insertOne(doc);
    idMap.pedidos.set(pedido.id, insertResult.insertedId);
  }
  
  console.log(`   ✅ ${pedidos.length} pedidos migrados (con detalles embebidos)`);
}

async function main() {
  console.log('\n🔄 INICIANDO MIGRACIÓN DE PostgreSQL A MongoDB\n');
  console.log('================================================');
  
  let pgClient;
  let mongoClient;
  
  try {
    // Conectar a PostgreSQL
    console.log('\n🔌 Conectando a PostgreSQL...');
    pgClient = await pgPool.connect();
    console.log('   ✅ Conectado a PostgreSQL');
    
    // Conectar a MongoDB
    console.log('\n🔌 Conectando a MongoDB...');
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    const mongoDb = mongoClient.db(mongoDbName);
    console.log('   ✅ Conectado a MongoDB');
    
    // Limpiar colecciones existentes (opcional)
    console.log('\n🗑️  Limpiando colecciones existentes...');
    const collections = ['clientes', 'usuarios', 'inventario', 'productos', 'pedidos'];
    for (const col of collections) {
      await mongoDb.collection(col).deleteMany({});
    }
    console.log('   ✅ Colecciones limpiadas');
    
    // Migrar en orden (respetando dependencias)
    await migrateClientes(pgClient, mongoDb);
    await migrateUsuarios(pgClient, mongoDb);
    await migrateInventario(pgClient, mongoDb);
    await migrateProductos(pgClient, mongoDb);
    await migratePedidos(pgClient, mongoDb);
    
    console.log('\n================================================');
    console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE\n');
    
    // Mostrar resumen
    console.log('📊 RESUMEN:');
    console.log(`   - Clientes:   ${idMap.clientes.size}`);
    console.log(`   - Usuarios:   ${idMap.usuarios.size}`);
    console.log(`   - Inventario: ${idMap.inventario.size}`);
    console.log(`   - Productos:  ${idMap.productos.size}`);
    console.log(`   - Pedidos:    ${idMap.pedidos.size}`);
    console.log('');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA MIGRACIÓN:', error);
    process.exit(1);
  } finally {
    // Cerrar conexiones
    if (pgClient) {
      pgClient.release();
    }
    await pgPool.end();
    
    if (mongoClient) {
      await mongoClient.close();
    }
    
    console.log('🔌 Conexiones cerradas\n');
  }
}

// Ejecutar migración
main();
