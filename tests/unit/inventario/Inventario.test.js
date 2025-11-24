const Inventario = require('../../../src/modules/inventario/domain/entities/Inventario');

describe('Inventario Entity', () => {
  describe('Constructor', () => {
    test('debe crear un inventario con todos los campos', () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);

      expect(inventario.id).toBe(1);
      expect(inventario.nombre).toBe('Ron Blanco');
      expect(inventario.cantidadDisponible).toBe(5000);
      expect(inventario.unidad).toBe('ml');
      expect(inventario.tipo).toBe('Licor');
      expect(inventario.stockMinimo).toBe(1000);
    });
  });

  describe('actualizarCantidad', () => {
    test('debe actualizar la cantidad correctamente', () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);

      inventario.actualizarCantidad(3000);

      expect(inventario.cantidadDisponible).toBe(3000);
    });

    test('debe permitir cantidad cero', () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);

      inventario.actualizarCantidad(0);

      expect(inventario.cantidadDisponible).toBe(0);
    });

    test('debe lanzar error si la cantidad es negativa', () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);

      expect(() => {
        inventario.actualizarCantidad(-100);
      }).toThrow('La cantidad no puede ser negativa');
    });

    test('debe mantener la cantidad anterior si falla la actualización', () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);

      try {
        inventario.actualizarCantidad(-100);
      } catch (error) {
        // Ignorar el error
      }

      expect(inventario.cantidadDisponible).toBe(5000);
    });
  });

  describe('esBajoStock', () => {
    test('debe retornar true si la cantidad está por debajo del stock mínimo', () => {
      const inventario = new Inventario(1, 'Ron Blanco', 800, 'ml', 'Licor', 1000);

      expect(inventario.esBajoStock()).toBe(true);
    });

    test('debe retornar false si la cantidad es igual al stock mínimo', () => {
      const inventario = new Inventario(1, 'Ron Blanco', 1000, 'ml', 'Licor', 1000);

      expect(inventario.esBajoStock()).toBe(false);
    });

    test('debe retornar false si la cantidad es mayor al stock mínimo', () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);

      expect(inventario.esBajoStock()).toBe(false);
    });

    test('debe retornar true si la cantidad es cero', () => {
      const inventario = new Inventario(1, 'Ron Blanco', 0, 'ml', 'Licor', 1000);

      expect(inventario.esBajoStock()).toBe(true);
    });

    test('debe detectar bajo stock después de actualizar cantidad', () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);
      
      expect(inventario.esBajoStock()).toBe(false);
      
      inventario.actualizarCantidad(500);
      
      expect(inventario.esBajoStock()).toBe(true);
    });
  });

  describe('fromPrimitives', () => {
    test('debe crear un inventario desde datos primitivos', () => {
      const data = {
        id: 1,
        nombre: 'Ron Blanco',
        cantidad_disponible: '5000',
        unidad: 'ml',
        tipo: 'Licor',
        stock_minimo: '1000'
      };

      const inventario = Inventario.fromPrimitives(data);

      expect(inventario.id).toBe(1);
      expect(inventario.nombre).toBe('Ron Blanco');
      expect(inventario.cantidadDisponible).toBe(5000);
      expect(inventario.unidad).toBe('ml');
      expect(inventario.tipo).toBe('Licor');
      expect(inventario.stockMinimo).toBe(1000);
    });

    test('debe parsear correctamente los valores numéricos', () => {
      const data = {
        id: 1,
        nombre: 'Jugo Limón',
        cantidad_disponible: '2500.50',
        unidad: 'ml',
        tipo: 'Insumo',
        stock_minimo: '500.25'
      };

      const inventario = Inventario.fromPrimitives(data);

      expect(inventario.cantidadDisponible).toBe(2500.50);
      expect(inventario.stockMinimo).toBe(500.25);
      expect(typeof inventario.cantidadDisponible).toBe('number');
      expect(typeof inventario.stockMinimo).toBe('number');
    });
  });

  describe('toPrimitives', () => {
    test('debe convertir el inventario a primitivos', () => {
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);

      const primitives = inventario.toPrimitives();

      expect(primitives).toEqual({
        id: 1,
        nombre: 'Ron Blanco',
        cantidad_disponible: 5000,
        unidad: 'ml',
        tipo: 'Licor',
        stock_minimo: 1000
      });
    });

    test('debe preservar los valores numéricos decimales', () => {
      const inventario = new Inventario(1, 'Jugo Limón', 2500.50, 'ml', 'Insumo', 500.25);

      const primitives = inventario.toPrimitives();

      expect(primitives.cantidad_disponible).toBe(2500.50);
      expect(primitives.stock_minimo).toBe(500.25);
    });
  });

  describe('Integración de métodos', () => {
    test('debe funcionar el flujo completo: crear, actualizar y verificar stock', () => {
      // Crear inventario con stock suficiente
      const inventario = new Inventario(1, 'Ron Blanco', 5000, 'ml', 'Licor', 1000);
      
      expect(inventario.esBajoStock()).toBe(false);

      // Consumir inventario hasta quedar bajo stock
      inventario.actualizarCantidad(800);
      
      expect(inventario.esBajoStock()).toBe(true);
      expect(inventario.cantidadDisponible).toBe(800);

      // Reponer inventario
      inventario.actualizarCantidad(3000);
      
      expect(inventario.esBajoStock()).toBe(false);
      expect(inventario.cantidadDisponible).toBe(3000);
    });
  });
});
