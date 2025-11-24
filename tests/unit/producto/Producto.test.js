const Producto = require('../../../src/modules/producto/domain/entities/Producto');

describe('Producto Entity', () => {
  describe('Constructor', () => {
    test('debe crear un producto con todos los campos', () => {
      const producto = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);

      expect(producto.id).toBe(1);
      expect(producto.nombre).toBe('Mojito');
      expect(producto.precio).toBe(6500);
      expect(producto.categoria).toBe('Cocteles');
      expect(producto.disponibilidad).toBe(true);
      expect(producto.tiempoPreparacionEstimado).toBe(5);
    });

    test('debe crear un producto sin disponibilidad por defecto', () => {
      const producto = new Producto(1, 'Piscola', 4500, 'Tragos', false, 2);

      expect(producto.disponibilidad).toBe(false);
    });
  });

  describe('cambiarDisponibilidad', () => {
    test('debe cambiar disponibilidad a false', () => {
      const producto = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);
      
      producto.cambiarDisponibilidad(false);
      
      expect(producto.disponibilidad).toBe(false);
    });

    test('debe cambiar disponibilidad a true', () => {
      const producto = new Producto(1, 'Mojito', 6500, 'Cocteles', false, 5);
      
      producto.cambiarDisponibilidad(true);
      
      expect(producto.disponibilidad).toBe(true);
    });
  });

  describe('actualizarPrecio', () => {
    test('debe actualizar el precio correctamente', () => {
      const producto = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);
      
      producto.actualizarPrecio(7000);
      
      expect(producto.precio).toBe(7000);
    });

    test('debe lanzar error si el precio es cero', () => {
      const producto = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);
      
      expect(() => {
        producto.actualizarPrecio(0);
      }).toThrow('El precio debe ser mayor a cero');
    });

    test('debe lanzar error si el precio es negativo', () => {
      const producto = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);
      
      expect(() => {
        producto.actualizarPrecio(-100);
      }).toThrow('El precio debe ser mayor a cero');
    });
  });

  describe('esDisponible', () => {
    test('debe retornar true si el producto está disponible', () => {
      const producto = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);
      
      expect(producto.esDisponible()).toBe(true);
    });

    test('debe retornar false si el producto no está disponible', () => {
      const producto = new Producto(1, 'Mojito', 6500, 'Cocteles', false, 5);
      
      expect(producto.esDisponible()).toBe(false);
    });
  });

  describe('fromPrimitives', () => {
    test('debe crear un producto desde datos primitivos', () => {
      const data = {
        id: 1,
        nombre: 'Mojito',
        precio: '6500',
        categoria: 'Cocteles',
        disponibilidad: true,
        tiempo_preparacion_estimado: '5'
      };

      const producto = Producto.fromPrimitives(data);

      expect(producto.id).toBe(1);
      expect(producto.nombre).toBe('Mojito');
      expect(producto.precio).toBe(6500);
      expect(producto.categoria).toBe('Cocteles');
      expect(producto.disponibilidad).toBe(true);
      expect(producto.tiempoPreparacionEstimado).toBe(5);
    });

    test('debe manejar tiempo de preparación undefined', () => {
      const data = {
        id: 1,
        nombre: 'Mojito',
        precio: '6500',
        categoria: 'Cocteles',
        disponibilidad: true
      };

      const producto = Producto.fromPrimitives(data);

      expect(producto.tiempoPreparacionEstimado).toBe(0);
    });
  });

  describe('toPrimitives', () => {
    test('debe convertir el producto a primitivos', () => {
      const producto = new Producto(1, 'Mojito', 6500, 'Cocteles', true, 5);

      const primitives = producto.toPrimitives();

      expect(primitives).toEqual({
        id: 1,
        nombre: 'Mojito',
        precio: 6500,
        categoria: 'Cocteles',
        disponibilidad: true,
        tiempo_preparacion_estimado: 5
      });
    });
  });
});
