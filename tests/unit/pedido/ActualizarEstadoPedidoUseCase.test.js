const ActualizarEstadoPedidoUseCase = require('../../../src/modules/pedido/application/usecases/ActualizarEstadoPedidoUseCase');
const Pedido = require('../../../src/modules/pedido/domain/entities/Pedido');

describe('ActualizarEstadoPedidoUseCase', () => {
  let useCase;
  let mockPedidoRepository;
  let mockEventPublisher;

  beforeEach(() => {
    mockPedidoRepository = {
      findById: jest.fn(),
      update: jest.fn()
    };
    mockEventPublisher = {
      publish: jest.fn()
    };
    useCase = new ActualizarEstadoPedidoUseCase(mockPedidoRepository, mockEventPublisher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Casos exitosos', () => {
    test('debe actualizar estado de pendiente a preparando', async () => {
      const pedido = new Pedido(1, 5, 2, 'pendiente', 13000, new Date());
      mockPedidoRepository.findById.mockResolvedValue(pedido);
      mockPedidoRepository.update.mockResolvedValue({
        ...pedido,
        estado: 'preparando'
      });

      const resultado = await useCase.execute(1, 'preparando');

      expect(resultado.estado).toBe('preparando');
      expect(mockPedidoRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ estado: 'preparando' })
      );
    });

    test('debe actualizar estado de preparando a listo', async () => {
      const pedido = new Pedido(1, 5, 2, 'preparando', 13000, new Date());
      mockPedidoRepository.findById.mockResolvedValue(pedido);
      mockPedidoRepository.update.mockResolvedValue({
        ...pedido,
        estado: 'listo'
      });

      const resultado = await useCase.execute(1, 'listo');

      expect(resultado.estado).toBe('listo');
    });

    test('debe actualizar estado de listo a entregado', async () => {
      const pedido = new Pedido(1, 5, 2, 'listo', 13000, new Date());
      mockPedidoRepository.findById.mockResolvedValue(pedido);
      mockPedidoRepository.update.mockResolvedValue({
        ...pedido,
        estado: 'entregado'
      });

      const resultado = await useCase.execute(1, 'entregado');

      expect(resultado.estado).toBe('entregado');
    });

    test('debe actualizar estado a cancelado', async () => {
      const pedido = new Pedido(1, 5, 2, 'pendiente', 13000, new Date());
      mockPedidoRepository.findById.mockResolvedValue(pedido);
      mockPedidoRepository.update.mockResolvedValue({
        ...pedido,
        estado: 'cancelado'
      });

      const resultado = await useCase.execute(1, 'cancelado');

      expect(resultado.estado).toBe('cancelado');
    });
  });

  describe('Event Publisher', () => {
    test('debe publicar evento con el estado anterior y nuevo', async () => {
      const pedido = new Pedido(1, 5, 2, 'pendiente', 13000, new Date());
      mockPedidoRepository.findById.mockResolvedValue(pedido);
      mockPedidoRepository.update.mockResolvedValue({
        ...pedido,
        estado: 'preparando'
      });

      await useCase.execute(1, 'preparando');

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'pedido_estado_actualizado',
        expect.objectContaining({
          pedidoId: 1,
          estadoAnterior: 'pendiente',
          estadoNuevo: 'preparando',
          timestamp: expect.any(String)
        })
      );
    });

    test('debe publicar evento para cada cambio de estado', async () => {
      const pedido = new Pedido(1, 5, 2, 'pendiente', 13000, new Date());
      mockPedidoRepository.findById.mockResolvedValue(pedido);
      mockPedidoRepository.update.mockResolvedValue(pedido);

      await useCase.execute(1, 'preparando');

      expect(mockEventPublisher.publish).toHaveBeenCalledTimes(1);
    });

    test('no debe fallar si no hay event publisher', async () => {
      const useCaseSinPublisher = new ActualizarEstadoPedidoUseCase(
        mockPedidoRepository,
        null
      );

      const pedido = new Pedido(1, 5, 2, 'pendiente', 13000, new Date());
      mockPedidoRepository.findById.mockResolvedValue(pedido);
      mockPedidoRepository.update.mockResolvedValue({
        ...pedido,
        estado: 'preparando'
      });

      await expect(useCaseSinPublisher.execute(1, 'preparando')).resolves.not.toThrow();
    });
  });

  describe('Validaciones', () => {
    test('debe lanzar error si el pedido no existe', async () => {
      mockPedidoRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999, 'preparando')).rejects.toThrow(
        'Pedido con id 999 no encontrado'
      );

      expect(mockPedidoRepository.update).not.toHaveBeenCalled();
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    test('debe lanzar error con estado inválido', async () => {
      const pedido = new Pedido(1, 5, 2, 'pendiente', 13000, new Date());
      mockPedidoRepository.findById.mockResolvedValue(pedido);

      await expect(useCase.execute(1, 'invalido')).rejects.toThrow(
        'Estado inválido: invalido'
      );

      expect(mockPedidoRepository.update).not.toHaveBeenCalled();
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    test('debe validar estados permitidos', async () => {
      const pedido = new Pedido(1, 5, 2, 'pendiente', 13000, new Date());
      mockPedidoRepository.findById.mockResolvedValue(pedido);

      const estadosInvalidos = ['pagado', 'enviado', 'devuelto', ''];

      for (const estado of estadosInvalidos) {
        await expect(useCase.execute(1, estado)).rejects.toThrow(
          `Estado inválido: ${estado}`
        );
      }
    });
  });

  describe('Flujo completo de estados', () => {
    test('debe permitir el flujo normal: pendiente -> preparando -> listo -> entregado', async () => {
      const pedido = new Pedido(1, 5, 2, 'pendiente', 13000, new Date());
      
      // Pendiente a Preparando
      mockPedidoRepository.findById.mockResolvedValue(pedido);
      mockPedidoRepository.update.mockResolvedValue({
        ...pedido,
        estado: 'preparando'
      });
      await useCase.execute(1, 'preparando');

      // Preparando a Listo
      pedido.estado = 'preparando';
      mockPedidoRepository.findById.mockResolvedValue(pedido);
      mockPedidoRepository.update.mockResolvedValue({
        ...pedido,
        estado: 'listo'
      });
      await useCase.execute(1, 'listo');

      // Listo a Entregado
      pedido.estado = 'listo';
      mockPedidoRepository.findById.mockResolvedValue(pedido);
      mockPedidoRepository.update.mockResolvedValue({
        ...pedido,
        estado: 'entregado'
      });
      await useCase.execute(1, 'entregado');

      expect(mockEventPublisher.publish).toHaveBeenCalledTimes(3);
    });

    test('debe permitir cancelar desde cualquier estado', async () => {
      const estados = ['pendiente', 'preparando', 'listo'];

      for (const estadoInicial of estados) {
        const pedido = new Pedido(1, 5, 2, estadoInicial, 13000, new Date());
        mockPedidoRepository.findById.mockResolvedValue(pedido);
        mockPedidoRepository.update.mockResolvedValue({
          ...pedido,
          estado: 'cancelado'
        });

        await expect(useCase.execute(1, 'cancelado')).resolves.not.toThrow();
      }
    });
  });
});
