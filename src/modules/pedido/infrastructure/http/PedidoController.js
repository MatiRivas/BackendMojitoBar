/**
 * Controlador HTTP - Adaptador de entrada
 */
class PedidoController {
  constructor(
    crearPedidoUseCase,
    obtenerPedidosUseCase,
    obtenerPedidoPorIdUseCase,
    actualizarEstadoPedidoUseCase
  ) {
    this.crearPedidoUseCase = crearPedidoUseCase;
    this.obtenerPedidosUseCase = obtenerPedidosUseCase;
    this.obtenerPedidoPorIdUseCase = obtenerPedidoPorIdUseCase;
    this.actualizarEstadoPedidoUseCase = actualizarEstadoPedidoUseCase;
  }

  async crear(req, res) {
    try {
      const pedido = await this.crearPedidoUseCase.execute(req.body);
      res.status(201).json(pedido.toPrimitives());
    } catch (error) {
      console.error('Error creando pedido:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async obtenerTodos(req, res) {
    try {
      const { estado } = req.query;
      const pedidos = await this.obtenerPedidosUseCase.execute({ estado });
      res.json(pedidos.map(p => p.toPrimitives()));
    } catch (error) {
      console.error('Error obteniendo pedidos:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const id = req.params.id;
      
      if (!id || id.trim() === '') {
        return res.status(400).json({ error: 'ID es requerido' });
      }

      const pedido = await this.obtenerPedidoPorIdUseCase.execute(id);
      res.json(pedido.toPrimitives());
    } catch (error) {
      console.error('Error obteniendo pedido:', error);
      const statusCode = error.message.includes('no encontrado') ? 404 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async actualizarEstado(req, res) {
    try {
      const id = req.params.id;
      const { estado } = req.body;

      if (!id || id.trim() === '') {
        return res.status(400).json({ error: 'ID es requerido' });
      }

      if (!estado) {
        return res.status(400).json({ error: 'El estado es requerido' });
      }

      const pedido = await this.actualizarEstadoPedidoUseCase.execute(id, estado);
      res.json(pedido.toPrimitives());
    } catch (error) {
      console.error('Error actualizando estado:', error);
      const statusCode = error.message.includes('no encontrado') ? 404 : 400;
      res.status(statusCode).json({ error: error.message });
    }
  }
}

module.exports = PedidoController;
