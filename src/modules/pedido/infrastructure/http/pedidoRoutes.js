const express = require('express');

function createPedidoRoutes(pedidoController) {
  const router = express.Router();

  // Crear pedido
  router.post('/', (req, res) => pedidoController.crear(req, res));

  // Obtener todos los pedidos (con filtro opcional por estado)
  router.get('/', (req, res) => pedidoController.obtenerTodos(req, res));

  // Obtener pedido por ID
  router.get('/:id', (req, res) => pedidoController.obtenerPorId(req, res));

  // Actualizar estado del pedido
  router.patch('/:id/estado', (req, res) => pedidoController.actualizarEstado(req, res));

  return router;
}

module.exports = createPedidoRoutes;
