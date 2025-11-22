/**
 * Contenedor de Inyección de Dependencias
 * Configura y conecta todos los módulos siguiendo arquitectura hexagonal
 */

// Shared infrastructure
const postgresClient = require('../shared/infrastructure/database/postgresClient');
const { getRedisClient } = require('../shared/infrastructure/events/redisClient');

// Módulo Inventario - Adaptadores
const PostgresInventarioRepository = require('../modules/inventario/infrastructure/adapters/PostgresInventarioRepository');
const RedisEventPublisher = require('../modules/inventario/infrastructure/adapters/RedisEventPublisher');

// Módulo Inventario - Casos de uso
const ActualizarInventarioUseCase = require('../modules/inventario/application/usecases/ActualizarInventarioUseCase');
const ObtenerInventarioUseCase = require('../modules/inventario/application/usecases/ObtenerInventarioUseCase');

// Módulo Inventario - Controlador
const InventarioController = require('../modules/inventario/infrastructure/http/InventarioController');

// Módulo Producto - Adaptadores
const PostgresProductoRepository = require('../modules/producto/infrastructure/adapters/PostgresProductoRepository');

// Módulo Producto - Casos de uso
const CrearProductoUseCase = require('../modules/producto/application/usecases/CrearProductoUseCase');
const ObtenerProductosUseCase = require('../modules/producto/application/usecases/ObtenerProductosUseCase');
const ObtenerProductoPorIdUseCase = require('../modules/producto/application/usecases/ObtenerProductoPorIdUseCase');
const ActualizarProductoUseCase = require('../modules/producto/application/usecases/ActualizarProductoUseCase');
const EliminarProductoUseCase = require('../modules/producto/application/usecases/EliminarProductoUseCase');

// Módulo Producto - Controlador
const ProductoController = require('../modules/producto/infrastructure/http/ProductoController');

class DependencyContainer {
  constructor() {
    this.dependencies = {};
  }

  async initialize() {
    // Infraestructura compartida
    const redisClient = await getRedisClient();
    
    // ==================== MÓDULO INVENTARIO ====================
    // Adaptadores (implementaciones de puertos)
    const inventarioRepository = new PostgresInventarioRepository(postgresClient);
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
    const productoRepository = new PostgresProductoRepository(postgresClient);

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

    // Guardar en el contenedor
    this.dependencies = {
      // Infraestructura
      postgresClient,
      redisClient,
      eventPublisher,
      
      // Módulo Inventario
      inventarioController,
      
      // Módulo Producto
      productoController,
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
