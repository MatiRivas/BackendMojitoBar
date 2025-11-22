const inventarioService = require('../../src/application/services/inventarioService');
const postgresClient = require('../../src/infrastructure/db/postgresClient');
const redisClient = require('../../src/infrastructure/cache/redisClient');

jest.mock('../../src/infrastructure/db/postgresClient');
jest.mock('../../src/infrastructure/cache/redisClient');

describe('inventarioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('actualizarInventario actualiza postgres y publica evento', async () => {
    postgresClient.actualizarCantidadInventario.mockResolvedValue({ id: 1, cantidad_disponible: 10 });
    redisClient.publicarEvento.mockResolvedValue();

    await inventarioService.actualizarInventario(1, 5);

    expect(postgresClient.actualizarCantidadInventario).toHaveBeenCalledWith(1,5);
    expect(redisClient.publicarEvento).toHaveBeenCalledWith('inventario_actualizado', expect.any(String));
  });

  test('obtenerInventario devuelve dato de postgres', async () => {
    const mockInventario = { id: 2, cantidad_disponible: 15 };
    postgresClient.obtenerInventarioPorId.mockResolvedValue(mockInventario);

    const resultado = await inventarioService.obtenerInventario(2);
    expect(resultado).toEqual(mockInventario);
  });
});
