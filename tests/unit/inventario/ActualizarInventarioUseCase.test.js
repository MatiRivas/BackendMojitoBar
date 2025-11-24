const ActualizarInventarioUseCase = require('../../../src/modules/inventario/application/usecases/ActualizarInventarioUseCase');
const Inventario = require('../../../src/modules/inventario/domain/entities/Inventario');

describe('ActualizarInventarioUseCase', () => {
  let useCase;
  let mockInventarioRepository;
  let mockEventPublisher;

  beforeEach(() => {
    mockInventarioRepository = {
      findById: jest.fn(),
      update: jest.fn()
    };
    mockEventPublisher = {
      publish: jest.fn()
    };
    useCase = new ActualizarInventarioUseCase(mockInventarioRepository, mockEventPublisher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Casos exitosos', () => {
    test('debe actualizar la cantidad de inventario', async () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);
      mockInventarioRepository.update.mockResolvedValue({
        ...inventario,
        cantidadDisponible: 3000
      });

      const resultado = await useCase.execute(1, 3000);

      expect(resultado.cantidadDisponible).toBe(3000);
      expect(mockInventarioRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ cantidadDisponible: 3000 })
      );
    });

    test('debe permitir actualizar a cantidad cero', async () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);
      mockInventarioRepository.update.mockResolvedValue({
        ...inventario,
        cantidadDisponible: 0
      });

      const resultado = await useCase.execute(1, 0);

      expect(resultado.cantidadDisponible).toBe(0);
    });

    test('debe aumentar la cantidad de inventario', async () => {
      const inventario = new Inventario(1, 'Ron Blanco', 2000, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);
      mockInventarioRepository.update.mockResolvedValue({
        ...inventario,
        cantidadDisponible: 8000
      });

      const resultado = await useCase.execute(1, 8000);

      expect(resultado.cantidadDisponible).toBe(8000);
    });

    test('debe disminuir la cantidad de inventario', async () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);
      mockInventarioRepository.update.mockResolvedValue({
        ...inventario,
        cantidadDisponible: 500
      });

      const resultado = await useCase.execute(1, 500);

      expect(resultado.cantidadDisponible).toBe(500);
    });
  });

  describe('Event Publisher', () => {
    test('debe publicar evento con la cantidad anterior y nueva', async () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);
      mockInventarioRepository.update.mockResolvedValue({
        ...inventario,
        cantidadDisponible: 3000
      });

      await useCase.execute(1, 3000);

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'inventario_actualizado',
        expect.objectContaining({
          inventarioId: 1,
          nombre: 'Ron Blanco',
          cantidadAnterior: 5000,
          cantidadNueva: 3000,
          unidad: 'ml',
          bajoStock: false,
          timestamp: expect.any(String)
        })
      );
    });

    test('debe indicar bajo stock en el evento cuando corresponda', async () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);
      mockInventarioRepository.update.mockResolvedValue({
        ...inventario,
        cantidadDisponible: 500
      });

      await useCase.execute(1, 500);

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'inventario_actualizado',
        expect.objectContaining({
          bajoStock: true
        })
      );
    });

    test('debe indicar stock normal en el evento cuando no está bajo', async () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);
      mockInventarioRepository.update.mockResolvedValue({
        ...inventario,
        cantidadDisponible: 3000
      });

      await useCase.execute(1, 3000);

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'inventario_actualizado',
        expect.objectContaining({
          bajoStock: false
        })
      );
    });

    test('no debe fallar si no hay event publisher', async () => {
      const useCaseSinPublisher = new ActualizarInventarioUseCase(
        mockInventarioRepository,
        null
      );

      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);
      mockInventarioRepository.update.mockResolvedValue({
        ...inventario,
        cantidadDisponible: 3000
      });

      await expect(useCaseSinPublisher.execute(1, 3000)).resolves.not.toThrow();
    });

    test('debe publicar evento cada vez que se actualiza', async () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);
      mockInventarioRepository.update.mockResolvedValue(inventario);

      await useCase.execute(1, 4000);
      await useCase.execute(1, 3000);
      await useCase.execute(1, 2000);

      expect(mockEventPublisher.publish).toHaveBeenCalledTimes(3);
    });
  });

  describe('Validaciones', () => {
    test('debe lanzar error si el inventario no existe', async () => {
      mockInventarioRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999, 3000)).rejects.toThrow(
        'Inventario con id 999 no encontrado'
      );

      expect(mockInventarioRepository.update).not.toHaveBeenCalled();
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    test('debe lanzar error si la cantidad es negativa', async () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);

      await expect(useCase.execute(1, -100)).rejects.toThrow(
        'La cantidad no puede ser negativa'
      );

      expect(mockInventarioRepository.update).not.toHaveBeenCalled();
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    test('debe lanzar error con cantidad muy negativa', async () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);

      await expect(useCase.execute(1, -5000)).rejects.toThrow(
        'La cantidad no puede ser negativa'
      );
    });
  });

  describe('Detección de bajo stock', () => {
    test('debe detectar cuando el inventario queda bajo stock', async () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);
      
      inventario.actualizarCantidad(500);
      mockInventarioRepository.update.mockResolvedValue(inventario);

      await useCase.execute(1, 500);

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'inventario_actualizado',
        expect.objectContaining({
          bajoStock: true
        })
      );
    });

    test('debe detectar cuando el inventario vuelve a stock normal', async () => {
      const inventario = new Inventario(1, 'Ron Blanco', 500, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);
      mockInventarioRepository.update.mockResolvedValue({
        ...inventario,
        cantidadDisponible: 2000
      });

      await useCase.execute(1, 2000);

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'inventario_actualizado',
        expect.objectContaining({
          cantidadAnterior: 500,
          cantidadNueva: 2000,
          bajoStock: false
        })
      );
    });

    test('debe considerar bajo stock cuando cantidad = 0', async () => {
      const inventario = new Inventario(1, 'Ron Blanco', 1000, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);
      
      inventario.actualizarCantidad(0);
      mockInventarioRepository.update.mockResolvedValue(inventario);

      await useCase.execute(1, 0);

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'inventario_actualizado',
        expect.objectContaining({
          bajoStock: true
        })
      );
    });
  });

  describe('Escenarios de uso real', () => {
    test('debe manejar consumo de inventario al preparar bebidas', async () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);
      
      // Consumir 150ml (2 mojitos)
      mockInventarioRepository.update.mockResolvedValue({
        ...inventario,
        cantidadDisponible: 4850
      });

      const resultado = await useCase.execute(1, 4850);

      expect(resultado.cantidadDisponible).toBe(4850);
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'inventario_actualizado',
        expect.objectContaining({
          cantidadAnterior: 5000,
          cantidadNueva: 4850
        })
      );
    });

    test('debe manejar reabastecimiento de inventario', async () => {
      const inventario = new Inventario(1, 'Ron Blanco', 800, 'ml', 'Licor', 1000);
      mockInventarioRepository.findById.mockResolvedValue(inventario);
      
      // Reabastecer con una botella de 750ml
      mockInventarioRepository.update.mockResolvedValue({
        ...inventario,
        cantidadDisponible: 1550
      });

      const resultado = await useCase.execute(1, 1550);

      expect(resultado.cantidadDisponible).toBe(1550);
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'inventario_actualizado',
        expect.objectContaining({
          cantidadAnterior: 800,
          cantidadNueva: 1550,
          bajoStock: false
        })
      );
    });
  });
});
