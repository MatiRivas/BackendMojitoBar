const express = require('express');

/**
 * Factory para crear rutas de inventario
 * Recibe el controlador ya configurado con sus dependencias
 */
function createInventarioRoutes(inventarioController) {
  const router = express.Router();

  router.post('/actualizar', (req, res) => 
    inventarioController.actualizar(req, res)
  );

  router.get('/:inventarioId', (req, res) => 
    inventarioController.obtener(req, res)
  );

  return router;
}

module.exports = createInventarioRoutes;
