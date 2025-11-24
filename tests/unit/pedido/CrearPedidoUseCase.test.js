const CrearPedidoUseCase = require('../../../src/modules/pedido/application/usecases/CrearPedidoUseCase');

describe('CrearPedidoUseCase', () => {
  let useCase;
  let mockPedidoRepository;
  let mockProductoRepository;
  let mockEventPublisher;

  beforeEach(() => {
    mockPedidoRepository = {
      save: jest.fn()
    };
    mockProductoRepository = {
      findById: jest.fn()
    };
    mockEventPublisher = {
      publish: jest.fn()
    };

    useCase = new CrearPedidoUseCase(
      mockPedidoRepository,
      mockProductoRepository,
      mockEventPublisher
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Casos exitosos', () => {
    test('debe crear un pedido con un producto', async () => {
      const data = {
        usuario_id: 2,
        cliente_id: 1,
        productos: [
          { producto_id: 1, cantidad: 2 }
        ]
      };

      const productoMock = {
        id: 1,
        nombre: 'Mojito',
        precio: 6500,
        disponibilidad: true
      };

      const pedidoCreado = {
        id: 10,
        cliente_id: 1,
        usuario_id: 2,
        estado: 'pendiente',
        total: 13000,
        fecha_hora: new Date(),
        detalles: [
          {
            id: 1,
            pedido_id: 10,
            producto_id: 1,
            cantidad: 2,
            precio_unitario: 6500,
            subtotal: 13000
          }
        ]
      };

      mockProductoRepository.findById.mockResolvedValue(productoMock);
      mockPedidoRepository.save.mockResolvedValue(pedidoCreado);

      const resultado = await useCase.execute(data);

      expect(resultado).toEqual(pedidoCreado);
      expect(mockProductoRepository.findById).toHaveBeenCalledWith(1);
      expect(mockPedidoRepository.save).toHaveBeenCalledTimes(1);
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'pedido_creado',
        expect.objectContaining({
          pedidoId: 10,
          estado: 'pendiente',
          total: 13000,
          cantidadProductos: 1
        })
      );
    });

    test('debe crear un pedido con múltiples productos', async () => {
      const data = {
        usuario_id: 2,
        cliente_id: 1,
        productos: [
          { producto_id: 1, cantidad: 2 },
          { producto_id: 2, cantidad: 1 },
          { producto_id: 3, cantidad: 3 }
        ]
      };

      const productos = [
        { id: 1, nombre: 'Mojito', precio: 6500, disponibilidad: true },
        { id: 2, nombre: 'Piscola', precio: 4500, disponibilidad: true },
        { id: 3, nombre: 'Shot', precio: 3000, disponibilidad: true }
      ];

      mockProductoRepository.findById
        .mockResolvedValueOnce(productos[0])
        .mockResolvedValueOnce(productos[1])
        .mockResolvedValueOnce(productos[2]);

      const pedidoCreado = {
        id: 10,
        cliente_id: 1,
        usuario_id: 2,
        estado: 'pendiente',
        total: 26500, // (6500*2) + (4500*1) + (3000*3)
        fecha_hora: new Date(),
        detalles: []
      };

      mockPedidoRepository.save.mockResolvedValue(pedidoCreado);

      const resultado = await useCase.execute(data);

      expect(resultado.total).toBe(26500);
      expect(mockProductoRepository.findById).toHaveBeenCalledTimes(3);
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'pedido_creado',
        expect.objectContaining({
          cantidadProductos: 3
        })
      );
    });

    test('debe crear pedido sin cliente_id', async () => {
      const data = {
        usuario_id: 2,
        productos: [
          { producto_id: 1, cantidad: 1 }
        ]
      };

      const productoMock = {
        id: 1,
        nombre: 'Mojito',
        precio: 6500,
        disponibilidad: true
      };

      mockProductoRepository.findById.mockResolvedValue(productoMock);
      mockPedidoRepository.save.mockResolvedValue({
        id: 10,
        cliente_id: null,
        usuario_id: 2,
        estado: 'pendiente',
        total: 6500,
        fecha_hora: new Date(),
        detalles: []
      });

      const resultado = await useCase.execute(data);

      expect(resultado.cliente_id).toBeNull();
    });

    test('debe calcular correctamente el total con diferentes cantidades', async () => {
      const data = {
        usuario_id: 2,
        productos: [
          { producto_id: 1, cantidad: 5 }
        ]
      };

      const productoMock = {
        id: 1,
        nombre: 'Mojito',
        precio: 6500,
        disponibilidad: true
      };

      mockProductoRepository.findById.mockResolvedValue(productoMock);
      mockPedidoRepository.save.mockResolvedValue({
        id: 10,
        usuario_id: 2,
        estado: 'pendiente',
        total: 32500,
        fecha_hora: new Date(),
        detalles: []
      });

      const resultado = await useCase.execute(data);

      expect(resultado.total).toBe(32500);
    });
  });

  describe('Validaciones', () => {
    test('debe lanzar error si no hay usuario_id', async () => {
      const data = {
        productos: [
          { producto_id: 1, cantidad: 2 }
        ]
      };

      await expect(useCase.execute(data)).rejects.toThrow(
        'El usuario_id es requerido'
      );

      expect(mockProductoRepository.findById).not.toHaveBeenCalled();
      expect(mockPedidoRepository.save).not.toHaveBeenCalled();
    });

    test('debe lanzar error si no hay productos', async () => {
      const data = {
        usuario_id: 2,
        productos: []
      };

      await expect(useCase.execute(data)).rejects.toThrow(
        'Debe incluir al menos un producto'
      );

      expect(mockProductoRepository.findById).not.toHaveBeenCalled();
      expect(mockPedidoRepository.save).not.toHaveBeenCalled();
    });

    test('debe lanzar error si productos es null', async () => {
      const data = {
        usuario_id: 2,
        productos: null
      };

      await expect(useCase.execute(data)).rejects.toThrow(
        'Debe incluir al menos un producto'
      );
    });

    test('debe lanzar error si productos es undefined', async () => {
      const data = {
        usuario_id: 2
      };

      await expect(useCase.execute(data)).rejects.toThrow(
        'Debe incluir al menos un producto'
      );
    });

    test('debe lanzar error si el producto no existe', async () => {
      const data = {
        usuario_id: 2,
        productos: [
          { producto_id: 999, cantidad: 2 }
        ]
      };

      mockProductoRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(data)).rejects.toThrow(
        'Producto con id 999 no encontrado'
      );

      expect(mockPedidoRepository.save).not.toHaveBeenCalled();
    });

    test('debe lanzar error si el producto no está disponible', async () => {
      const data = {
        usuario_id: 2,
        productos: [
          { producto_id: 1, cantidad: 2 }
        ]
      };

      const productoMock = {
        id: 1,
        nombre: 'Mojito',
        precio: 6500,
        disponibilidad: false
      };

      mockProductoRepository.findById.mockResolvedValue(productoMock);

      await expect(useCase.execute(data)).rejects.toThrow(
        'Producto Mojito no está disponible'
      );

      expect(mockPedidoRepository.save).not.toHaveBeenCalled();
    });

    test('debe validar disponibilidad de todos los productos', async () => {
      const data = {
        usuario_id: 2,
        productos: [
          { producto_id: 1, cantidad: 2 },
          { producto_id: 2, cantidad: 1 }
        ]
      };

      const producto1 = {
        id: 1,
        nombre: 'Mojito',
        precio: 6500,
        disponibilidad: true
      };

      const producto2 = {
        id: 2,
        nombre: 'Piscola',
        precio: 4500,
        disponibilidad: false
      };

      mockProductoRepository.findById
        .mockResolvedValueOnce(producto1)
        .mockResolvedValueOnce(producto2);

      await expect(useCase.execute(data)).rejects.toThrow(
        'Producto Piscola no está disponible'
      );
    });
  });

  describe('Event Publisher', () => {
    test('debe publicar evento con todos los datos correctos', async () => {
      const data = {
        usuario_id: 2,
        cliente_id: 1,
        productos: [
          { producto_id: 1, cantidad: 2 }
        ]
      };

      const productoMock = {
        id: 1,
        precio: 6500,
        disponibilidad: true
      };

      mockProductoRepository.findById.mockResolvedValue(productoMock);
      mockPedidoRepository.save.mockResolvedValue({
        id: 10,
        estado: 'pendiente',
        total: 13000
      });

      await useCase.execute(data);

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'pedido_creado',
        expect.objectContaining({
          pedidoId: 10,
          estado: 'pendiente',
          total: 13000,
          cantidadProductos: 1,
          timestamp: expect.any(String)
        })
      );
    });

    test('no debe fallar si no hay event publisher', async () => {
      const useCaseSinPublisher = new CrearPedidoUseCase(
        mockPedidoRepository,
        mockProductoRepository,
        null
      );

      const data = {
        usuario_id: 2,
        productos: [
          { producto_id: 1, cantidad: 1 }
        ]
      };

      const productoMock = {
        id: 1,
        precio: 6500,
        disponibilidad: true
      };

      mockProductoRepository.findById.mockResolvedValue(productoMock);
      mockPedidoRepository.save.mockResolvedValue({
        id: 10,
        total: 6500
      });

      await expect(useCaseSinPublisher.execute(data)).resolves.not.toThrow();
    });
  });
});
