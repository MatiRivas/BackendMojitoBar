# 🧪 Guía de Unit Tests

## 📊 Resumen de Cobertura

### Tests Creados: **8 archivos de test**

| Módulo | Archivo | Tests | Cobertura |
|--------|---------|-------|-----------|
| **Producto** | Producto.test.js | 17 tests | Entidad completa |
| **Producto** | CrearProductoUseCase.test.js | 12 tests | Caso de uso completo |
| **Producto** | ActualizarProductoUseCase.test.js | 18 tests | Caso de uso completo |
| **Pedido** | Pedido.test.js | 20 tests | Entidad completa |
| **Pedido** | DetallePedido.test.js | 8 tests | Entidad completa |
| **Pedido** | CrearPedidoUseCase.test.js | 19 tests | Caso de uso completo |
| **Pedido** | ActualizarEstadoPedidoUseCase.test.js | 16 tests | Caso de uso completo |
| **Inventario** | Inventario.test.js | 16 tests | Entidad completa |
| **Inventario** | ActualizarInventarioUseCase.test.js | 20 tests | Caso de uso completo |

**Total: 146 tests unitarios** 🎯

---

## 🚀 Ejecutar los Tests

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests con cobertura
```bash
npm test -- --coverage
```

### Ejecutar tests en modo watch
```bash
npm test -- --watch
```

### Ejecutar tests de un módulo específico
```bash
# Solo tests de producto
npm test -- producto

# Solo tests de pedido
npm test -- pedido

# Solo tests de inventario
npm test -- inventario
```

### Ejecutar un archivo específico
```bash
# Solo tests de la entidad Producto
npm test -- Producto.test.js

# Solo tests de CrearPedidoUseCase
npm test -- CrearPedidoUseCase.test.js
```

### Ejecutar con detalles verbosos
```bash
npm test -- --verbose
```

---

## 📁 Estructura de Tests

```
tests/
├── unit/
│   ├── producto/
│   │   ├── Producto.test.js                    ← Entidad
│   │   ├── CrearProductoUseCase.test.js        ← Caso de uso
│   │   └── ActualizarProductoUseCase.test.js   ← Caso de uso
│   ├── pedido/
│   │   ├── Pedido.test.js                      ← Entidad
│   │   ├── DetallePedido.test.js               ← Entidad
│   │   ├── CrearPedidoUseCase.test.js          ← Caso de uso
│   │   └── ActualizarEstadoPedidoUseCase.test.js ← Caso de uso
│   └── inventario/
│       ├── Inventario.test.js                  ← Entidad
│       └── ActualizarInventarioUseCase.test.js ← Caso de uso
└── integration/
    └── socket.test.js
```

---

## ✅ Qué se está probando

### 1. **Entidades de Dominio** (Lógica de Negocio)

#### Producto
- ✅ Creación con todos los campos
- ✅ Cambiar disponibilidad
- ✅ Actualizar precio (con validación > 0)
- ✅ Verificar disponibilidad
- ✅ Conversión desde/hacia primitivos

#### Pedido
- ✅ Creación con diferentes configuraciones
- ✅ Agregar detalles
- ✅ Recalcular total automáticamente
- ✅ Cambiar estado (validación de estados)
- ✅ Conversión desde/hacia primitivos

#### DetallePedido
- ✅ Creación con cálculo automático de subtotal
- ✅ Conversión desde/hacia primitivos

#### Inventario
- ✅ Creación con todos los campos
- ✅ Actualizar cantidad (validación >= 0)
- ✅ Detectar bajo stock
- ✅ Conversión desde/hacia primitivos

### 2. **Casos de Uso** (Application Layer)

#### CrearProductoUseCase
- ✅ Crear producto exitosamente
- ✅ Validación de nombre requerido
- ✅ Validación de precio > 0
- ✅ Valores por defecto (disponibilidad, tiempo)

#### ActualizarProductoUseCase
- ✅ Actualizar campos individuales
- ✅ Actualizar múltiples campos
- ✅ Actualización parcial
- ✅ Validación de producto existente
- ✅ Validación de precio

#### CrearPedidoUseCase
- ✅ Crear pedido con uno o múltiples productos
- ✅ Cálculo correcto del total
- ✅ Validación de usuario_id
- ✅ Validación de productos disponibles
- ✅ Publicación de eventos

#### ActualizarEstadoPedidoUseCase
- ✅ Cambiar entre todos los estados válidos
- ✅ Validación de estados inválidos
- ✅ Flujo completo de estados
- ✅ Publicación de eventos con estado anterior/nuevo

#### ActualizarInventarioUseCase
- ✅ Aumentar/disminuir cantidad
- ✅ Validación de cantidad negativa
- ✅ Detección de bajo stock
- ✅ Publicación de eventos con alertas
- ✅ Escenarios de uso real (consumo/reabastecimiento)

---

## 🎯 Estrategia de Testing

### Tipos de Tests Incluidos

1. **Tests de Casos Exitosos** ✅
   - Verifican que el código funciona correctamente
   - Cubren diferentes escenarios válidos

2. **Tests de Validaciones** ⚠️
   - Verifican que se rechazan datos inválidos
   - Aseguran que se lanzan errores apropiados

3. **Tests de Eventos** 📢
   - Verifican que se publican eventos correctamente
   - Incluyen datos esperados en los eventos

4. **Tests de Integración de Métodos** 🔗
   - Verifican flujos completos
   - Combinan múltiples operaciones

### Mocking

Todos los casos de uso usan **mocks** de:
- ✅ Repositorios (no se conecta a BD real)
- ✅ Event Publishers (no se publican eventos reales)
- ✅ Tests completamente aislados y rápidos

---

## 📊 Configuración de Jest

El proyecto ya tiene Jest configurado. Si necesitas personalizar:

### jest.config.js (crear si no existe)
```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**',
    '!src/**/infrastructure/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

---

## 🐛 Ejemplos de Uso

### Verificar que un test pasa
```bash
npm test -- Producto.test.js
```

Deberías ver:
```
PASS  tests/unit/producto/Producto.test.js
  Producto Entity
    Constructor
      ✓ debe crear un producto con todos los campos (3 ms)
      ✓ debe crear un producto sin disponibilidad por defecto (1 ms)
    cambiarDisponibilidad
      ✓ debe cambiar disponibilidad a false (1 ms)
    ...

Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
```

### Ver cobertura
```bash
npm test -- --coverage
```

Verás una tabla con:
```
-----------------|---------|----------|---------|---------|
File             | % Stmts | % Branch | % Funcs | % Lines |
-----------------|---------|----------|---------|---------|
All files        |   95.23 |    91.66 |   97.22 |   95.12 |
 Producto.js     |     100 |      100 |     100 |     100 |
 Pedido.js       |     100 |      100 |     100 |     100 |
 ...             |         |          |         |         |
-----------------|---------|----------|---------|---------|
```

---

## 🔍 Debugging Tests

### Agregar console.log en tests
```javascript
test('debe crear un producto', async () => {
  console.log('Datos de prueba:', data);
  const resultado = await useCase.execute(data);
  console.log('Resultado:', resultado);
  expect(resultado).toBeDefined();
});
```

### Ejecutar un solo test
```javascript
test.only('debe crear un producto', async () => {
  // Este es el único que se ejecutará
});
```

### Saltar un test temporalmente
```javascript
test.skip('debe crear un producto', async () => {
  // Este test será ignorado
});
```

---

## 📈 Mejores Prácticas

### ✅ Hacer
- **AAA Pattern**: Arrange (preparar) → Act (actuar) → Assert (verificar)
- Nombres descriptivos de tests
- Un concepto por test
- Usar mocks para dependencias externas
- Limpiar mocks después de cada test

### ❌ No Hacer
- Tests dependientes entre sí
- Tests que modifican estado global
- Tests que dependen de orden de ejecución
- Tests con muchas aserciones

---

## 🚦 Próximos Pasos

### Tests que faltan (opcionales):

1. **ObtenerProductoPorIdUseCase.test.js**
2. **ObtenerProductosUseCase.test.js**
3. **EliminarProductoUseCase.test.js**
4. **ObtenerPedidoPorIdUseCase.test.js**
5. **ObtenerPedidosUseCase.test.js**
6. **ObtenerInventarioUseCase.test.js**

### Integration Tests
- Tests con PostgreSQL real
- Tests con Redis real
- Tests de WebSocket

### E2E Tests
- Tests de flujos completos HTTP
- Tests con Supertest

---

## 📞 Comandos Útiles

```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm test -- --coverage

# Tests en watch mode
npm test -- --watch

# Tests verbosos
npm test -- --verbose

# Un archivo específico
npm test -- Producto.test.js

# Tests de un módulo
npm test -- producto

# Ver solo tests fallidos
npm test -- --onlyFailures

# Actualizar snapshots
npm test -- --updateSnapshot

# Ejecutar tests en paralelo
npm test -- --maxWorkers=4

# Generar reporte HTML de cobertura
npm test -- --coverage --coverageReporters=html
```

---

## 🎓 Recursos

- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Arquitectura Hexagonal Testing](https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/)

---

**¡Listo para ejecutar! 🚀**

```bash
npm test
```
