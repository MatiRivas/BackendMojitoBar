const ActualizarProductoUseCase = require('../../../src/modules/producto/application/usecases/ActualizarProductoUseCase');
const Producto = require('../../../src/modules/producto/domain/entities/Producto');

describe('ActualizarProductoUseCase', () => {
  let useCase;
  let mockProductoRepository;

  beforeEach(() => {
    mockProductoRepository = {
      findById: jest.fn(),
      update: jest.fn()
    };
    useCase = new ActualizarProductoUseCase(mockProductoRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Casos exitosos', () => {
    test('debe actualizar el nombre del producto', async () => {
      const productoExistente = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);
      const productoActualizado = new Producto(1, 'Mojito Premium', 6500, 'Cocteles', true, 5);

      mockProductoRepository.findById.mockResolvedValue(productoExistente);
      mockProductoRepository.update.mockResolvedValue(productoActualizado);

      const resultado = await useCase.execute(1, { nombre: 'Mojito Premium' });

      expect(resultado.nombre).toBe('Mojito Premium');
      expect(mockProductoRepository.findById).toHaveBeenCalledWith(1);
      expect(mockProductoRepository.update).toHaveBeenCalledTimes(1);
    });

    test('debe actualizar el precio del producto', async () => {
      const productoExistente = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);
      const productoActualizado = new Producto(1, 'Mojito', 7000, 'Cocteles', true, 5);

      mockProductoRepository.findById.mockResolvedValue(productoExistente);
      mockProductoRepository.update.mockResolvedValue(productoActualizado);

      const resultado = await useCase.execute(1, { precio: 7000 });

      expect(resultado.precio).toBe(7000);
    });

    test('debe actualizar la categoría del producto', async () => {
      const productoExistente = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);
      const productoActualizado = new Producto(1, 'Mojito', 6500, 'Premium', true, 5);

      mockProductoRepository.findById.mockResolvedValue(productoExistente);
      mockProductoRepository.update.mockResolvedValue(productoActualizado);

      const resultado = await useCase.execute(1, { categoria: 'Premium' });

      expect(resultado.categoria).toBe('Premium');
    });

    test('debe actualizar la disponibilidad del producto', async () => {
      const productoExistente = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);
      const productoActualizado = new Producto(1, 'Mojito', 6500, 'Cocteles', false, 5);

      mockProductoRepository.findById.mockResolvedValue(productoExistente);
      mockProductoRepository.update.mockResolvedValue(productoActualizado);

      const resultado = await useCase.execute(1, { disponibilidad: false });

      expect(resultado.disponibilidad).toBe(false);
    });

    test('debe actualizar el tiempo de preparación', async () => {
      const productoExistente = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);
      const productoActualizado = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 8);

      mockProductoRepository.findById.mockResolvedValue(productoExistente);
      mockProductoRepository.update.mockResolvedValue(productoActualizado);

      const resultado = await useCase.execute(1, { tiempo_preparacion_estimado: 8 });

      expect(resultado.tiempoPreparacionEstimado).toBe(8);
    });

    test('debe actualizar múltiples campos a la vez', async () => {
      const productoExistente = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);
      const productoActualizado = new Producto(1, 'Mojito Premium', 7500, 'Premium', false, 8);

      mockProductoRepository.findById.mockResolvedValue(productoExistente);
      mockProductoRepository.update.mockResolvedValue(productoActualizado);

      const resultado = await useCase.execute(1, {
        nombre: 'Mojito Premium',
        precio: 7500,
        categoria: 'Premium',
        disponibilidad: false,
        tiempo_preparacion_estimado: 8
      });

      expect(resultado.nombre).toBe('Mojito Premium');
      expect(resultado.precio).toBe(7500);
      expect(resultado.categoria).toBe('Premium');
      expect(resultado.disponibilidad).toBe(false);
      expect(resultado.tiempoPreparacionEstimado).toBe(8);
    });

    test('no debe modificar campos no enviados', async () => {
      const productoExistente = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);

      mockProductoRepository.findById.mockResolvedValue(productoExistente);
      mockProductoRepository.update.mockImplementation(p => Promise.resolve(p));

      await useCase.execute(1, { precio: 7000 });

      expect(mockProductoRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Mojito', // No cambió
          categoria: 'Cocteles', // No cambió
          disponibilidad: true, // No cambió
          tiempoPreparacionEstimado: 5 // No cambió
        })
      );
    });
  });

  describe('Validaciones', () => {
    test('debe lanzar error si el producto no existe', async () => {
      mockProductoRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999, { precio: 7000 })).rejects.toThrow(
        'Producto con id 999 no encontrado'
      );

      expect(mockProductoRepository.update).not.toHaveBeenCalled();
    });

    test('debe lanzar error si el precio es cero', async () => {
      const productoExistente = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);
      mockProductoRepository.findById.mockResolvedValue(productoExistente);

      await expect(useCase.execute(1, { precio: 0 })).rejects.toThrow(
        'El precio debe ser mayor a cero'
      );

      expect(mockProductoRepository.update).not.toHaveBeenCalled();
    });

    test('debe lanzar error si el precio es negativo', async () => {
      const productoExistente = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);
      mockProductoRepository.findById.mockResolvedValue(productoExistente);

      await expect(useCase.execute(1, { precio: -100 })).rejects.toThrow(
        'El precio debe ser mayor a cero'
      );
    });
  });

  describe('Actualización parcial', () => {
    test('debe permitir actualizar solo el precio', async () => {
      const productoExistente = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);

      mockProductoRepository.findById.mockResolvedValue(productoExistente);
      mockProductoRepository.update.mockImplementation(p => Promise.resolve(p));

      await useCase.execute(1, { precio: 7000 });

      expect(mockProductoRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          precio: 7000,
          nombre: 'Mojito',
          categoria: 'Cocteles',
          disponibilidad: true,
          tiempoPreparacionEstimado: 5
        })
      );
    });

    test('debe permitir actualizar solo la disponibilidad', async () => {
      const productoExistente = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);

      mockProductoRepository.findById.mockResolvedValue(productoExistente);
      mockProductoRepository.update.mockImplementation(p => Promise.resolve(p));

      await useCase.execute(1, { disponibilidad: false });

      expect(mockProductoRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          disponibilidad: false,
          precio: 6500,
          nombre: 'Mojito',
          categoria: 'Cocteles',
          tiempoPreparacionEstimado: 5
        })
      );
    });
  });
});
