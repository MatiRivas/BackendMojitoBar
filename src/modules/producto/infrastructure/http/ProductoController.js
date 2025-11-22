/**
 * Controlador HTTP - Adaptador de entrada
 */
class ProductoController {
  constructor(
    obtenerProductosUseCase,
    obtenerProductoPorIdUseCase,
    crearProductoUseCase,
    actualizarProductoUseCase,
    eliminarProductoUseCase
  ) {
    this.obtenerProductosUseCase = obtenerProductosUseCase;
    this.obtenerProductoPorIdUseCase = obtenerProductoPorIdUseCase;
    this.crearProductoUseCase = crearProductoUseCase;
    this.actualizarProductoUseCase = actualizarProductoUseCase;
    this.eliminarProductoUseCase = eliminarProductoUseCase;
  }

  async obtenerTodos(req, res) {
    try {
      const productos = await this.obtenerProductosUseCase.execute();
      res.json(productos.map(p => p.toPrimitives()));
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID debe ser un número' });
      }

      const producto = await this.obtenerProductoPorIdUseCase.execute(id);
      res.json(producto.toPrimitives());
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      const statusCode = error.message.includes('no encontrado') ? 404 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async crear(req, res) {
    try {
      const nuevoProducto = await this.crearProductoUseCase.execute(req.body);
      res.status(201).json(nuevoProducto.toPrimitives());
    } catch (error) {
      console.error('Error creando producto:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID debe ser un número' });
      }

      const productoActualizado = await this.actualizarProductoUseCase.execute(id, req.body);
      res.json(productoActualizado.toPrimitives());
    } catch (error) {
      console.error('Error actualizando producto:', error);
      const statusCode = error.message.includes('no encontrado') ? 404 : 400;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID debe ser un número' });
      }

      await this.eliminarProductoUseCase.execute(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error eliminando producto:', error);
      const statusCode = error.message.includes('no encontrado') ? 404 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }
}

module.exports = ProductoController;
