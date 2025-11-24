/**
 * Contenedor de Inyección de Dependencias
 * Configura y conecta todos los módulos siguiendo arquitectura hexagonal
 */

// Shared infrastructure
const mongoClient = require('../shared/infrastructure/database/mongoClient');
const { getRedisClient } = require('../shared/infrastructure/events/redisClient');

// Módulo Inventario - Adaptadores
const MongoInventarioRepository = require('../modules/inventario/infrastructure/adapters/MongoInventarioRepository');
const RedisEventPublisher = require('../modules/inventario/infrastructure/adapters/RedisEventPublisher');

// Módulo Inventario - Casos de uso
const ActualizarInventarioUseCase = require('../modules/inventario/application/usecases/ActualizarInventarioUseCase');
const ObtenerInventarioUseCase = require('../modules/inventario/application/usecases/ObtenerInventarioUseCase');

// Módulo Inventario - Controlador
const InventarioController = require('../modules/inventario/infrastructure/http/InventarioController');

// Módulo Producto - Adaptadores
const MongoProductoRepository = require('../modules/producto/infrastructure/adapters/MongoProductoRepository');

// Módulo Producto - Casos de uso
const CrearProductoUseCase = require('../modules/producto/application/usecases/CrearProductoUseCase');
const ObtenerProductosUseCase = require('../modules/producto/application/usecases/ObtenerProductosUseCase');
const ObtenerProductoPorIdUseCase = require('../modules/producto/application/usecases/ObtenerProductoPorIdUseCase');
const ActualizarProductoUseCase = require('../modules/producto/application/usecases/ActualizarProductoUseCase');
const EliminarProductoUseCase = require('../modules/producto/application/usecases/EliminarProductoUseCase');

// Módulo Producto - Controlador
const ProductoController = require('../modules/producto/infrastructure/http/ProductoController');

// Módulo Pedido - Adaptadores
const MongoPedidoRepository = require('../modules/pedido/infrastructure/adapters/MongoPedidoRepository');

// Módulo Pedido - Casos de uso
const CrearPedidoUseCase = require('../modules/pedido/application/usecases/CrearPedidoUseCase');
const ObtenerPedidosUseCase = require('../modules/pedido/application/usecases/ObtenerPedidosUseCase');
const ObtenerPedidoPorIdUseCase = require('../modules/pedido/application/usecases/ObtenerPedidoPorIdUseCase');
const ActualizarEstadoPedidoUseCase = require('../modules/pedido/application/usecases/ActualizarEstadoPedidoUseCase');

// Módulo Pedido - Controlador
const PedidoController = require('../modules/pedido/infrastructure/http/PedidoController');

class DependencyContainer {
  constructor() {
    this.dependencies = {};
  }

  async initialize() {
    // Conectar a MongoDB
    await mongoClient.connect();
    
    // Infraestructura compartida
    const redisClient = await getRedisClient();
    
    // ==================== MÓDULO INVENTARIO ====================
    // Adaptadores (implementaciones de puertos)
    const inventarioRepository = new MongoInventarioRepository(mongoClient);
    const eventPublisher = redisClient ? new RedisEventPublisher(redisClient) : null;

    // Casos de uso (lógica de aplicación)
    const actualizarInventarioUseCase = new ActualizarInventarioUseCase(
      inventarioRepository,
      eventPublisher
    );
    const obtenerInventarioUseCase = new ObtenerInventarioUseCase(inventarioRepository);

    // Controlador (adaptador de entrada HTTP)
    const inventarioController = new InventarioController(
      actualizarInventarioUseCase,
      obtenerInventarioUseCase
    );

    // ==================== MÓDULO PRODUCTO ====================
    // Adaptadores
    const productoRepository = new MongoProductoRepository(mongoClient);

    // Casos de uso
    const crearProductoUseCase = new CrearProductoUseCase(productoRepository);
    const obtenerProductosUseCase = new ObtenerProductosUseCase(productoRepository);
    const obtenerProductoPorIdUseCase = new ObtenerProductoPorIdUseCase(productoRepository);
    const actualizarProductoUseCase = new ActualizarProductoUseCase(productoRepository);
    const eliminarProductoUseCase = new EliminarProductoUseCase(productoRepository);

    // Controlador
    const productoController = new ProductoController(
      obtenerProductosUseCase,
      obtenerProductoPorIdUseCase,
      crearProductoUseCase,
      actualizarProductoUseCase,
      eliminarProductoUseCase
    );

    // ==================== MÓDULO PEDIDO ====================
    // Adaptadores
    const pedidoRepository = new MongoPedidoRepository(mongoClient);

    // Casos de uso
    const crearPedidoUseCase = new CrearPedidoUseCase(
      pedidoRepository,
      productoRepository,
      eventPublisher
    );
    const obtenerPedidosUseCase = new ObtenerPedidosUseCase(pedidoRepository);
    const obtenerPedidoPorIdUseCase = new ObtenerPedidoPorIdUseCase(pedidoRepository);
    const actualizarEstadoPedidoUseCase = new ActualizarEstadoPedidoUseCase(
      pedidoRepository,
      eventPublisher
    );

    // Controlador
    const pedidoController = new PedidoController(
      crearPedidoUseCase,
      obtenerPedidosUseCase,
      obtenerPedidoPorIdUseCase,
      actualizarEstadoPedidoUseCase
    );

    // Guardar en el contenedor
    this.dependencies = {
      // Infraestructura
      mongoClient,
      redisClient,
      eventPublisher,
      
      // Módulo Inventario
      inventarioController,
      
      // Módulo Producto
      productoController,

      // Módulo Pedido
      pedidoController,
    };

    return this.dependencies;
  }

  get(name) {
    if (this.dependencies[name] === undefined) {
      throw new Error(`Dependencia ${name} no encontrada`);
    }
    return this.dependencies[name];
  }
}

module.exports = DependencyContainer;
