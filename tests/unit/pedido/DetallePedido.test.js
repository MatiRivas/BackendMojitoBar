const DetallePedido = require('../../../src/modules/pedido/domain/entities/DetallePedido');

describe('DetallePedido Entity', () => {
  describe('Constructor', () => {
    test('debe crear un detalle de pedido con todos los campos', () => {
      const detalle = new DetallePedido(1, 5, 3, 2, 6500, 13000);

      expect(detalle.id).toBe(1);
      expect(detalle.pedidoId).toBe(5);
      expect(detalle.productoId).toBe(3);
      expect(detalle.cantidad).toBe(2);
      expect(detalle.precioUnitario).toBe(6500);
      expect(detalle.subtotal).toBe(13000);
    });

    test('debe calcular el subtotal automáticamente si no se proporciona', () => {
      const detalle = new DetallePedido(1, 5, 3, 2, 6500);

      expect(detalle.subtotal).toBe(13000);
    });

    test('debe calcular el subtotal correctamente con diferentes cantidades', () => {
      const detalle1 = new DetallePedido(1, 5, 3, 3, 5000);
      expect(detalle1.subtotal).toBe(15000);

      const detalle2 = new DetallePedido(2, 5, 4, 1, 4500);
      expect(detalle2.subtotal).toBe(4500);

      const detalle3 = new DetallePedido(3, 5, 5, 10, 3000);
      expect(detalle3.subtotal).toBe(30000);
    });

    test('debe usar el subtotal proporcionado si se pasa como parámetro', () => {
      const detalle = new DetallePedido(1, 5, 3, 2, 6500, 12000);

      expect(detalle.subtotal).toBe(12000);
    });
  });

  describe('fromPrimitives', () => {
    test('debe crear un detalle desde datos primitivos', () => {
      const data = {
        id: 1,
        pedido_id: 5,
        producto_id: 3,
        cantidad: '2',
        precio_unitario: '6500',
        subtotal: '13000'
      };

      const detalle = DetallePedido.fromPrimitives(data);

      expect(detalle.id).toBe(1);
      expect(detalle.pedidoId).toBe(5);
      expect(detalle.productoId).toBe(3);
      expect(detalle.cantidad).toBe(2);
      expect(detalle.precioUnitario).toBe(6500);
      expect(detalle.subtotal).toBe(13000);
    });

    test('debe parsear correctamente los tipos numéricos', () => {
      const data = {
        id: 1,
        pedido_id: 5,
        producto_id: 3,
        cantidad: '10',
        precio_unitario: '7500.50',
        subtotal: '75005.00'
      };

      const detalle = DetallePedido.fromPrimitives(data);

      expect(typeof detalle.cantidad).toBe('number');
      expect(typeof detalle.precioUnitario).toBe('number');
      expect(typeof detalle.subtotal).toBe('number');
      expect(detalle.cantidad).toBe(10);
      expect(detalle.precioUnitario).toBe(7500.50);
      expect(detalle.subtotal).toBe(75005);
    });
  });

  describe('toPrimitives', () => {
    test('debe convertir el detalle a primitivos', () => {
      const detalle = new DetallePedido(1, 5, 3, 2, 6500, 13000);

      const primitives = detalle.toPrimitives();

      expect(primitives).toEqual({
        id: 1,
        pedido_id: 5,
        producto_id: 3,
        cantidad: 2,
        precio_unitario: 6500,
        subtotal: 13000
      });
    });
  });
});
