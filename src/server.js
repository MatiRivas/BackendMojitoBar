const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const DependencyContainer = require('./config/dependencyInjection');
const createInventarioRoutes = require('./modules/inventario/infrastructure/http/inventarioRoutes');
const createProductoRoutes = require('./modules/producto/infrastructure/http/productoRoutes');
const createPedidoRoutes = require('./modules/pedido/infrastructure/http/pedidoRoutes');
const setupWebSocketServer = require('./shared/infrastructure/websocket/socketServer');

async function startServer() {
  // Inicializar contenedor de dependencias
  const container = new DependencyContainer();
  await container.initialize();

  // Configurar Express
  const app = express();
  app.use(express.json());

  // Crear servidor HTTP
  const server = http.createServer(app);

  // Configurar Socket.IO
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Inicializar WebSocket
  const eventPublisher = container.dependencies.eventPublisher || null;
  setupWebSocketServer(io, eventPublisher);

  // Registrar rutas de módulos
  const inventarioRoutes = createInventarioRoutes(container.get('inventarioController'));
  const productoRoutes = createProductoRoutes(container.get('productoController'));
  const pedidoRoutes = createPedidoRoutes(container.get('pedidoController'));

  app.use('/inventario', inventarioRoutes);
  app.use('/producto', productoRoutes);
  app.use('/pedido', pedidoRoutes);

  // Ruta de health check
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Iniciar servidor
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📦 Arquitectura: Hexagonal + Monolito Modular`);
    console.log(`📁 Módulos: Inventario, Producto, Pedido`);
  });
}

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

startServer().catch((error) => {
  console.error('Error iniciando servidor:', error);
  process.exit(1);
});
