# Arquitectura Hexagonal + Monolito Modular

## 📐 Estructura del Proyecto

```
src/
├── modules/                          # Módulos de negocio (Bounded Contexts)
│   ├── inventario/                   # Módulo Inventario
│   │   ├── domain/                   # Capa de Dominio (Núcleo)
│   │   │   ├── entities/             # Entidades de dominio
│   │   │   │   └── Inventario.js
│   │   │   └── ports/                # Puertos (Interfaces)
│   │   │       ├── InventarioRepository.js
│   │   │       └── EventPublisher.js
│   │   ├── application/              # Capa de Aplicación
│   │   │   └── usecases/             # Casos de uso
│   │   │       ├── ActualizarInventarioUseCase.js
│   │   │       └── ObtenerInventarioUseCase.js
│   │   └── infrastructure/           # Capa de Infraestructura
│   │       ├── adapters/             # Adaptadores (Implementaciones de puertos)
│   │       │   ├── PostgresInventarioRepository.js
│   │       │   └── RedisEventPublisher.js
│   │       └── http/                 # Adaptadores de entrada HTTP
│   │           ├── InventarioController.js
│   │           └── inventarioRoutes.js
│   │
│   └── producto/                     # Módulo Producto
│       ├── domain/
│       │   ├── entities/
│       │   │   └── Producto.js
│       │   └── ports/
│       │       └── ProductoRepository.js
│       ├── application/
│       │   └── usecases/
│       │       ├── CrearProductoUseCase.js
│       │       ├── ObtenerProductosUseCase.js
│       │       ├── ObtenerProductoPorIdUseCase.js
│       │       ├── ActualizarProductoUseCase.js
│       │       └── EliminarProductoUseCase.js
│       └── infrastructure/
│           ├── adapters/
│           │   └── PostgresProductoRepository.js
│           └── http/
│               ├── ProductoController.js
│               └── productoRoutes.js
│
├── shared/                           # Infraestructura compartida
│   └── infrastructure/
│       ├── database/
│       │   └── postgresClient.js     # Cliente PostgreSQL compartido
│       ├── events/
│       │   └── redisClient.js        # Cliente Redis compartido
│       └── websocket/
│           └── socketServer.js       # Servidor WebSocket
│
├── config/
│   └── dependencyInjection.js        # Contenedor de IoC
│
└── server.js                         # Punto de entrada
```

## 🎯 Principios de Arquitectura Hexagonal

### 1. **Inversión de Dependencias**
- El dominio NO depende de infraestructura
- Las dependencias fluyen de afuera hacia adentro
- Los puertos (interfaces) definen contratos
- Los adaptadores implementan los puertos

### 2. **Separación de Capas**

#### **Domain (Núcleo)**
- Entidades con lógica de negocio
- Puertos (interfaces) que definen contratos
- Independiente de frameworks y tecnologías
- No tiene dependencias externas

#### **Application**
- Casos de uso (orquestación de lógica)
- Depende solo del dominio
- Coordina entidades y puertos

#### **Infrastructure**
- Adaptadores de persistencia (Postgres, Redis)
- Adaptadores de entrada (HTTP, WebSocket)
- Implementaciones concretas de puertos
- Depende de dominio y aplicación

### 3. **Puertos y Adaptadores**

**Puertos (Interfaces):**
- `InventarioRepository`: contrato para persistencia
- `ProductoRepository`: contrato para persistencia
- `EventPublisher`: contrato para eventos

**Adaptadores (Implementaciones):**
- `PostgresInventarioRepository`: implementa persistencia con Postgres
- `PostgresProductoRepository`: implementa persistencia con Postgres
- `RedisEventPublisher`: implementa publicación de eventos
- `InventarioController`: adaptador HTTP de entrada
- `ProductoController`: adaptador HTTP de entrada

## 🏗️ Monolito Modular

### Módulos Independientes

Cada módulo (`inventario`, `producto`) es:
- **Autocontenido**: tiene su propio dominio, aplicación e infraestructura
- **Independiente**: puede evolucionar sin afectar otros módulos
- **Cohesivo**: agrupa funcionalidades relacionadas
- **Bajo acoplamiento**: se comunica por interfaces bien definidas

### Ventajas

1. **Escalabilidad del código**: módulos claros y separados
2. **Fácil mantenimiento**: cambios localizados
3. **Testing simplificado**: cada módulo se puede probar aisladamente
4. **Preparado para microservicios**: cada módulo puede extraerse fácilmente
5. **Desarrollo paralelo**: equipos pueden trabajar en módulos distintos

## 🔄 Flujo de Datos

### Ejemplo: Actualizar Inventario

```
1. HTTP Request → InventarioController (adaptador entrada)
2. Controller → ActualizarInventarioUseCase (caso de uso)
3. UseCase → InventarioRepository (puerto/interface)
4. PostgresInventarioRepository implementa el puerto
5. Se actualiza entidad Inventario (dominio)
6. UseCase → EventPublisher (puerto)
7. RedisEventPublisher publica evento
8. WebSocket emite notificación a clientes
```

**Dirección de dependencias:** 
```
Infrastructure → Application → Domain
     ↓              ↓            ↑
Adaptadores     Casos de Uso   Puertos
```

## 🔌 Inyección de Dependencias

El archivo `config/dependencyInjection.js` actúa como **contenedor IoC**:

1. Crea instancias de infraestructura (Postgres, Redis)
2. Crea adaptadores (repositories, event publishers)
3. Inyecta adaptadores en casos de uso
4. Inyecta casos de uso en controladores
5. Provee dependencias configuradas al server

**Beneficios:**
- Configuración centralizada
- Fácil testing (inyectar mocks)
- Bajo acoplamiento
- Inversión de control

## ✅ Cumplimiento de Principios SOLID

- **S** - Single Responsibility: cada clase tiene una única responsabilidad
- **O** - Open/Closed: extensible sin modificar código existente (puertos)
- **L** - Liskov Substitution: adaptadores intercambiables
- **I** - Interface Segregation: interfaces específicas (puertos)
- **D** - Dependency Inversion: dependencia en abstracciones (puertos)

## 🧪 Testing

Cada capa se puede testear independientemente:

```javascript
// Test de dominio (sin dependencias)
test('Inventario actualiza cantidad', () => {
  const inv = new Inventario(1, 100, 50, 'A1');
  inv.actualizarCantidad(75);
  expect(inv.cantidad).toBe(75);
});

// Test de caso de uso (con mocks)
test('ActualizarInventarioUseCase', async () => {
  const mockRepo = { findById: jest.fn(), update: jest.fn() };
  const useCase = new ActualizarInventarioUseCase(mockRepo);
  // ...
});

// Test de adaptador (con BD de prueba)
test('PostgresInventarioRepository', async () => {
  const repo = new PostgresInventarioRepository(testDB);
  // ...
});
```

## 🚀 Ejecución

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno (.env)
PG_USER=postgres
PG_HOST=localhost
PG_DB=mi_db
PG_PASSWORD=password
PG_PORT=5432
REDIS_URL=redis://localhost:6379
PORT=3000

# Iniciar servidor
npm start

# Desarrollo con hot-reload
npm run dev
```

## 📊 Comparación: Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| Dependencias | Services → Infrastructure directamente | Application → Ports → Adapters |
| Dominio | Vacío, sin lógica | Entidades con reglas de negocio |
| Testing | Difícil (dependencias acopladas) | Fácil (puertos mockeables) |
| Módulos | Mezclados en carpetas | Separados y autocontenidos |
| Escalabilidad | Monolito acoplado | Modular, preparado para microservicios |
| Mantenibilidad | Media | Alta |

## 🎓 Conceptos Clave

- **Puerto**: Interface que define un contrato (entrada o salida)
- **Adaptador**: Implementación concreta de un puerto
- **Caso de Uso**: Lógica de aplicación específica
- **Entidad**: Objeto de dominio con identidad y comportamiento
- **Módulo**: Bounded context con su propio dominio
- **Monolito Modular**: Aplicación única con módulos independientes
