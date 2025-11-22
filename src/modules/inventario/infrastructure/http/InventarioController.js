/**
 * Controlador HTTP - Adaptador de entrada
 * Maneja requests HTTP y delega a los casos de uso
 */
class InventarioController {
  constructor(actualizarInventarioUseCase, obtenerInventarioUseCase) {
    this.actualizarInventarioUseCase = actualizarInventarioUseCase;
    this.obtenerInventarioUseCase = obtenerInventarioUseCase;
  }

  async actualizar(req, res) {
    try {
      const { inventarioId, cantidad } = req.body;

      if (!inventarioId || cantidad === undefined) {
        return res.status(400).json({ 
          error: 'inventarioId y cantidad son requeridos' 
        });
      }

      const inventarioActualizado = await this.actualizarInventarioUseCase.execute(
        inventarioId, 
        cantidad
      );

      res.status(200).json({ 
        mensaje: 'Inventario actualizado',
        data: inventarioActualizado.toPrimitives()
      });
    } catch (error) {
      console.error('Error actualizando inventario:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async obtener(req, res) {
    try {
      const inventarioId = parseInt(req.params.inventarioId);

      if (isNaN(inventarioId)) {
        return res.status(400).json({ error: 'inventarioId debe ser un número' });
      }

      const inventario = await this.obtenerInventarioUseCase.execute(inventarioId);

      res.status(200).json(inventario.toPrimitives());
    } catch (error) {
      console.error('Error obteniendo inventario:', error);
      const statusCode = error.message.includes('no encontrado') ? 404 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }
}

module.exports = InventarioController;
