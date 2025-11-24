# Proyecto: Arquitectura Hexagonal + Monolito Modular

Sistema de gestión de productos e inventario implementando arquitectura hexagonal con monolito modular.

## 🎯 Estado del Proyecto

✅ **Funcionando correctamente**

- Servidor corriendo en puerto 3000
- Base de datos PostgreSQL configurada
- API REST completamente funcional
- Arquitectura hexagonal implementada
- Módulos independientes (Producto, Inventario)

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar base de datos
psql -U chupacarrillo -d llm -f database/schema.sql

# 3. Configurar .env (editar según tu configuración)
PG_USER=chupacarrillo
PG_PASSWORD=tu_password
PG_HOST=localhost
PG_PORT=5432
PG_DB=llm

# 4. Iniciar servidor
npm start

# 5. Probar API
./test-api.sh
```

## 📁 Estructura del Proyecto

```
src/
├── modules/              # Módulos de negocio independientes
│   ├── inventario/       # Módulo de inventario
│   │   ├── domain/       # Entidades y puertos
│   │   ├── application/  # Casos de uso
│   │   └── infrastructure/ # Adaptadores
│   └── producto/         # Módulo de productos
│       ├── domain/
│       ├── application/
│       └── infrastructure/
├── shared/               # Infraestructura compartida
│   └── infrastructure/
│       ├── database/     # PostgreSQL
│       ├── events/       # Redis (opcional)
│       └── websocket/    # Socket.IO
└── config/
    └── dependencyInjection.js  # IoC Container
```

## 🔌 API Endpoints

### Productos

- `GET /producto` - Listar todos
- `GET /producto/:id` - Obtener por ID
- `POST /producto` - Crear nuevo
- `PUT /producto/:id` - Actualizar
- `DELETE /producto/:id` - Eliminar

### Inventario

- `GET /inventario/:id` - Obtener por ID
- `POST /inventario/actualizar` - Actualizar cantidad

### Sistema

- `GET /health` - Health check

## 🏗️ Arquitectura

### Principios Implementados

✅ **Arquitectura Hexagonal (Puertos y Adaptadores)**
- Dominio independiente de infraestructura
- Puertos (interfaces) definen contratos
- Adaptadores implementan los puertos
- Inversión de dependencias

✅ **Monolito Modular**
- Módulos autocontenidos (Inventario, Producto)
- Bajo acoplamiento entre módulos
- Alta cohesión interna
- Preparado para microservicios

✅ **SOLID**
- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

### Capas

```
Infrastructure → Application → Domain
    ↓               ↓            ↑
Adaptadores    Casos de Uso   Puertos
```

## 📚 Documentación

- [ARQUITECTURA.md](ARQUITECTURA.md) - Detalles de arquitectura
- [SETUP.md](SETUP.md) - Guía de instalación completa

## 🧪 Testing

```bash
# Ejecutar script de pruebas
./test-api.sh

# Tests unitarios (próximamente)
npm test
```

## 🔧 Tecnologías

- **Node.js** - Runtime
- **Express** - Framework web
- **PostgreSQL** - Base de datos
- **Socket.IO** - WebSockets
- **Redis** - Eventos (opcional)

## 📊 Base de Datos

```sql
-- Ver productos
SELECT * FROM producto;

-- Ver inventario
SELECT * FROM inventario;
```

## 🐛 Troubleshooting

Ver [SETUP.md](SETUP.md) para solución de problemas comunes.

## 📝 Ejemplos de Uso

```bash
# Crear producto
curl -X POST http://localhost:3000/producto \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Café Latte",
    "precio": 3.50,
    "categoria": "Bebidas",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 5
  }'

# Actualizar inventario
curl -X POST http://localhost:3000/inventario/actualizar \
  -H "Content-Type: application/json" \
  -d '{"inventarioId": 1, "cantidad": 75}'
```

## 🎯 Demostración del Caso de Uso: ActualizarInventarioUseCase

Este es el caso de uso más completo que demuestra toda la arquitectura hexagonal.

### Paso 1: Obtener IDs de inventario disponibles

```bash
curl http://localhost:3000/inventario
```

Respuesta ejemplo:
```json
[
  {
    "id": 1,
    "nombre": "Ron Havana Club",
    "cantidad_disponible": 5000,
    "unidad": "ml",
    "stock_minimo": 1000
  }
]
```

### Paso 2: Actualizar la cantidad del inventario

```bash
curl -X POST http://localhost:3000/inventario/actualizar \
  -H "Content-Type: application/json" \
  -d '{"inventarioId": 1, "cantidad": 3000}'
```

Respuesta:
```json
{
  "mensaje": "Inventario actualizado",
  "data": {
    "id": 1,
    "nombre": "Ron Havana Club",
    "cantidad_disponible": 3000,
    "unidad": "ml"
  }
}
```

### Paso 3: Verificar el cambio

```bash
curl http://localhost:3000/inventario/1
```

### 📊 Lo que sucede internamente (Arquitectura Hexagonal):

```
1. HTTP Request (POST /inventario/actualizar)
   ↓
2. InventarioController (Infrastructure Layer)
   → Recibe y valida el request
   ↓
3. ActualizarInventarioUseCase (Application Layer)
   → Obtiene inventario actual desde PostgreSQL
   → Aplica lógica de dominio (actualizar cantidad)
   → Persiste cambios
   ↓
4. PostgresInventarioRepository (Infrastructure - Adapter)
   → UPDATE en PostgreSQL: cantidad_disponible = 3000
   ↓
5. RedisEventPublisher (Infrastructure - Adapter) [Opcional]
   → PUBLISH 'inventario_actualizado' con datos del cambio
   ↓
6. Socket.IO Server (Infrastructure) [Opcional]
   → Escucha evento de Redis
   → Emite a TODOS los clientes WebSocket conectados
   ↓
7. Frontend (si está abierto)
   → Recibe notificación instantánea
   → Actualiza interfaz SIN recargar página
```

### 🌐 Demostración con Frontend en Tiempo Real

**Nota:** Para habilitar las notificaciones en tiempo real, necesitas configurar Redis:

```bash
# Con Docker
docker run --name redis-llm -p 6379:6379 -d redis:7-alpine

# Configurar .env
REDIS_URL=redis://localhost:6379
```

1. **Abrir el frontend:**
   ```
   C:\Users\Hp\Desktop\LLMEntrega3\FrontendMojitoBar\index.html
   ```

2. **Ejecutar el curl de actualización**

3. **Ver en el frontend:**
   - ✅ El inventario se actualiza automáticamente
   - ✅ Aparece en el log de eventos en tiempo real
   - ✅ Animación visual del cambio

### 🔍 Verificar en PostgreSQL

```bash
psql -U chupacarrillo -d llm -c "SELECT * FROM inventario WHERE inventario_id = 1;"
```

### 📋 Archivos involucrados en el Caso de Uso:

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| **Domain** | `Inventario.js` | Entidad con lógica de negocio |
| **Domain** | `InventarioRepository.js` | Puerto (interface) |
| **Domain** | `EventPublisher.js` | Puerto para eventos |
| **Application** | `ActualizarInventarioUseCase.js` | Orquestación del caso de uso |
| **Infrastructure** | `PostgresInventarioRepository.js` | Adaptador PostgreSQL |
| **Infrastructure** | `RedisEventPublisher.js` | Adaptador Redis |
| **Infrastructure** | `InventarioController.js` | Adaptador HTTP |
| **Infrastructure** | `socketServer.js` | WebSocket en tiempo real |

Este caso de uso demuestra:
- ✅ **Separación de capas** (Domain, Application, Infrastructure)
- ✅ **Inversión de dependencias** (Domain no conoce PostgreSQL)
- ✅ **Puertos y Adaptadores** (Repository, EventPublisher)
- ✅ **Eventos asíncronos** (Redis Pub/Sub) [Opcional]
- ✅ **Comunicación en tiempo real** (Socket.IO) [Opcional]

## 🎓 Aprendizajes Clave

- **Puertos**: Interfaces que definen contratos
- **Adaptadores**: Implementaciones concretas
- **Casos de Uso**: Lógica de aplicación
- **Entidades**: Objetos de dominio con comportamiento
- **Inyección de Dependencias**: Configuración centralizada

## 🚀 Próximas Mejoras

- [ ] Autenticación JWT
- [ ] Tests unitarios completos
- [ ] Tests de integración
- [ ] Documentación Swagger
- [ ] Logging estructurado
- [ ] Rate limiting
- [ ] Caché con Redis
- [ ] CI/CD pipeline

## 👨‍💻 Desarrollo

```bash
# Modo desarrollo con hot-reload
npm run dev

# Ver logs de PostgreSQL
tail -f /usr/local/var/log/postgres.log

# Ver tablas
psql -U chupacarrillo -d llm -c "\dt"
```

---

**Arquitectura:** Hexagonal + Monolito Modular  
**Estado:** ✅ Funcionando  
**Versión:** 1.0.0
