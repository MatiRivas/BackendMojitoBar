const CrearProductoUseCase = require('../../../src/modules/producto/application/usecases/CrearProductoUseCase');

describe('CrearProductoUseCase', () => {
  let useCase;
  let mockProductoRepository;

  beforeEach(() => {
    mockProductoRepository = {
      save: jest.fn()
    };
    useCase = new CrearProductoUseCase(mockProductoRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Casos exitosos', () => {
    test('debe crear un producto con todos los campos', async () => {
      const data = {
        nombre: 'Mojito',
        precio: 6500,
        categoria: 'Cocteles',
        disponibilidad: true,
        tiempo_preparacion_estimado: 5
      };

      const productoEsperado = {
        id: 1,
        nombre: 'Mojito',
        precio: 6500,
        categoria: 'Cocteles',
        disponibilidad: true,
        tiempo_preparacion_estimado: 5
      };

      mockProductoRepository.save.mockResolvedValue(productoEsperado);

      const resultado = await useCase.execute(data);

      expect(resultado).toEqual(productoEsperado);
      expect(mockProductoRepository.save).toHaveBeenCalledTimes(1);
      expect(mockProductoRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Mojito',
          precio: 6500,
          categoria: 'Cocteles',
          disponibilidad: true,
          tiempoPreparacionEstimado: 5
        })
      );
    });

    test('debe crear producto con disponibilidad true por defecto', async () => {
      const data = {
        nombre: 'Piscola',
        precio: 4500
      };

      mockProductoRepository.save.mockResolvedValue({
        id: 2,
        ...data,
        disponibilidad: true
      });

      await useCase.execute(data);

      expect(mockProductoRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          disponibilidad: true
        })
      );
    });

    test('debe crear producto con tiempo_preparacion_estimado 0 por defecto', async () => {
      const data = {
        nombre: 'Cuba Libre',
        precio: 5000
      };

      mockProductoRepository.save.mockResolvedValue({
        id: 3,
        ...data
      });

      await useCase.execute(data);

      expect(mockProductoRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          tiempoPreparacionEstimado: 0
        })
      );
    });
  });

  describe('Validaciones', () => {
    test('debe lanzar error si el nombre está vacío', async () => {
      const data = {
        nombre: '',
        precio: 6500
      };

      await expect(useCase.execute(data)).rejects.toThrow(
        'El nombre del producto es requerido'
      );

      expect(mockProductoRepository.save).not.toHaveBeenCalled();
    });

    test('debe lanzar error si el nombre es solo espacios', async () => {
      const data = {
        nombre: '   ',
        precio: 6500
      };

      await expect(useCase.execute(data)).rejects.toThrow(
        'El nombre del producto es requerido'
      );
    });

    test('debe lanzar error si no hay nombre', async () => {
      const data = {
        precio: 6500
      };

      await expect(useCase.execute(data)).rejects.toThrow(
        'El nombre del producto es requerido'
      );
    });

    test('debe lanzar error si el precio es cero', async () => {
      const data = {
        nombre: 'Mojito',
        precio: 0
      };

      await expect(useCase.execute(data)).rejects.toThrow(
        'El precio debe ser mayor a cero'
      );
    });

    test('debe lanzar error si el precio es negativo', async () => {
      const data = {
        nombre: 'Mojito',
        precio: -100
      };

      await expect(useCase.execute(data)).rejects.toThrow(
        'El precio debe ser mayor a cero'
      );
    });

    test('debe lanzar error si no hay precio', async () => {
      const data = {
        nombre: 'Mojito'
      };

      await expect(useCase.execute(data)).rejects.toThrow(
        'El precio debe ser mayor a cero'
      );
    });
  });
});
