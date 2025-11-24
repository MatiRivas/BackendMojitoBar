const Pedido = require('../../../src/modules/pedido/domain/entities/Pedido');
const DetallePedido = require('../../../src/modules/pedido/domain/entities/DetallePedido');

describe('Pedido Entity', () => {
  describe('Constructor', () => {
    test('debe crear un pedido con todos los campos', () => {
      const fecha = new Date();
      const pedido = new Pedido(1, 5, 2, 'pendiente', 13000, fecha);

      expect(pedido.id).toBe(1);
      expect(pedido.clienteId).toBe(5);
      expect(pedido.usuarioId).toBe(2);
      expect(pedido.estado).toBe('pendiente');
      expect(pedido.total).toBe(13000);
      expect(pedido.fechaHora).toBe(fecha);
      expect(pedido.detalles).toEqual([]);
    });

    test('debe crear pedido con estado pendiente por defecto', () => {
      const pedido = new Pedido(1, 5, 2);

      expect(pedido.estado).toBe('pendiente');
    });

    test('debe crear pedido con total 0 por defecto', () => {
      const pedido = new Pedido(1, 5, 2);

      expect(pedido.total).toBe(0);
    });

    test('debe crear pedido con fecha actual por defecto', () => {
      const antes = new Date();
      const pedido = new Pedido(1, 5, 2);
      const despues = new Date();

      expect(pedido.fechaHora).toBeInstanceOf(Date);
      expect(pedido.fechaHora.getTime()).toBeGreaterThanOrEqual(antes.getTime());
      expect(pedido.fechaHora.getTime()).toBeLessThanOrEqual(despues.getTime());
    });
  });

  describe('agregarDetalle', () => {
    test('debe agregar un detalle al pedido', () => {
      const pedido = new Pedido(1, 5, 2, 'pendiente', 0, new Date());
      const detalle = new DetallePedido(1, 1, 3, 2, 6500, 13000);

      pedido.agregarDetalle(detalle);

      expect(pedido.detalles.length).toBe(1);
      expect(pedido.detalles[0]).toBe(detalle);
    });

    test('debe recalcular el total al agregar detalle', () => {
      const pedido = new Pedido(1, 5, 2, 'pendiente', 0, new Date());
      const detalle1 = new DetallePedido(1, 1, 3, 2, 6500, 13000);
      const detalle2 = new DetallePedido(2, 1, 4, 1, 4500, 4500);

      pedido.agregarDetalle(detalle1);
      expect(pedido.total).toBe(13000);

      pedido.agregarDetalle(detalle2);
      expect(pedido.total).toBe(17500);
    });
  });

  describe('recalcularTotal', () => {
    test('debe calcular el total de todos los detalles', () => {
      const pedido = new Pedido(1, 5, 2, 'pendiente', 0, new Date());
      
      pedido.detalles.push(new DetallePedido(1, 1, 3, 2, 6500, 13000));
      pedido.detalles.push(new DetallePedido(2, 1, 4, 1, 4500, 4500));
      pedido.detalles.push(new DetallePedido(3, 1, 5, 3, 3000, 9000));

      pedido.recalcularTotal();

      expect(pedido.total).toBe(26500);
    });

    test('debe retornar 0 si no hay detalles', () => {
      const pedido = new Pedido(1, 5, 2, 'pendiente', 0, new Date());

      pedido.recalcularTotal();

      expect(pedido.total).toBe(0);
    });
  });

  describe('cambiarEstado', () => {
    test('debe cambiar el estado a preparando', () => {
      const pedido = new Pedido(1, 5, 2, 'pendiente', 13000, new Date());

      pedido.cambiarEstado('preparando');

      expect(pedido.estado).toBe('preparando');
    });

    test('debe cambiar el estado a listo', () => {
      const pedido = new Pedido(1, 5, 2, 'preparando', 13000, new Date());

      pedido.cambiarEstado('listo');

      expect(pedido.estado).toBe('listo');
    });

    test('debe cambiar el estado a entregado', () => {
      const pedido = new Pedido(1, 5, 2, 'listo', 13000, new Date());

      pedido.cambiarEstado('entregado');

      expect(pedido.estado).toBe('entregado');
    });

    test('debe cambiar el estado a cancelado', () => {
      const pedido = new Pedido(1, 5, 2, 'pendiente', 13000, new Date());

      pedido.cambiarEstado('cancelado');

      expect(pedido.estado).toBe('cancelado');
    });

    test('debe lanzar error con estado inválido', () => {
      const pedido = new Pedido(1, 5, 2, 'pendiente', 13000, new Date());

      expect(() => {
        pedido.cambiarEstado('invalido');
      }).toThrow('Estado inválido: invalido');
    });

    test('debe validar todos los estados válidos', () => {
      const pedido = new Pedido(1, 5, 2, 'pendiente', 13000, new Date());
      const estadosValidos = ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'];

      estadosValidos.forEach(estado => {
        expect(() => {
          pedido.cambiarEstado(estado);
        }).not.toThrow();
      });
    });
  });

  describe('fromPrimitives', () => {
    test('debe crear un pedido desde datos primitivos', () => {
      const data = {
        id: 1,
        cliente_id: 5,
        usuario_id: 2,
        estado: 'preparando',
        total: '17500',
        fecha_hora: new Date('2025-11-24')
      };

      const pedido = Pedido.fromPrimitives(data);

      expect(pedido.id).toBe(1);
      expect(pedido.clienteId).toBe(5);
      expect(pedido.usuarioId).toBe(2);
      expect(pedido.estado).toBe('preparando');
      expect(pedido.total).toBe(17500);
      expect(pedido.fechaHora).toEqual(new Date('2025-11-24'));
    });
  });

  describe('toPrimitives', () => {
    test('debe convertir el pedido a primitivos', () => {
      const fecha = new Date('2025-11-24');
      const pedido = new Pedido(1, 5, 2, 'pendiente', 13000, fecha);
      const detalle = new DetallePedido(1, 1, 3, 2, 6500, 13000);
      pedido.detalles.push(detalle);

      const primitives = pedido.toPrimitives();

      expect(primitives).toEqual({
        id: 1,
        cliente_id: 5,
        usuario_id: 2,
        estado: 'pendiente',
        total: 13000,
        fecha_hora: fecha,
        detalles: [
          {
            id: 1,
            pedido_id: 1,
            producto_id: 3,
            cantidad: 2,
            precio_unitario: 6500,
            subtotal: 13000
          }
        ]
      });
    });
  });
});
