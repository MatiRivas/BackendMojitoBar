const express = require('express');

/**
 * Factory para crear rutas de producto
 */
function createProductoRoutes(productoController) {
  const router = express.Router();

  router.get('/', (req, res) => 
    productoController.obtenerTodos(req, res)
  );

  router.get('/:id', (req, res) => 
    productoController.obtenerPorId(req, res)
  );

  router.post('/', (req, res) => 
    productoController.crear(req, res)
  );

  router.put('/:id', (req, res) => 
    productoController.actualizar(req, res)
  );

  router.delete('/:id', (req, res) => 
    productoController.eliminar(req, res)
  );

  return router;
}

module.exports = createProductoRoutes;
