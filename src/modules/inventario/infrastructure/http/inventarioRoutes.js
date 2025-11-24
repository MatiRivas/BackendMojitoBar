const express = require('express');

/**
 * Factory para crear rutas de inventario
 * Recibe el controlador ya configurado con sus dependencias
 */
function createInventarioRoutes(inventarioController) {
  const router = express.Router();

  // Listar todos los inventarios
  router.get('/', (req, res) => 
    inventarioController.listarTodos(req, res)
  );

  // Actualizar inventario
  router.post('/actualizar', (req, res) => 
    inventarioController.actualizar(req, res)
  );

  // Obtener inventario por ID
  router.get('/:inventarioId', (req, res) => 
    inventarioController.obtener(req, res)
  );

  return router;
}

module.exports = createInventarioRoutes;
