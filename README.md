# Proyecto: Arquitectura Hexagonal + Monolito Modular

Sistema de gestión de productos e inventario implementando arquitectura hexagonal con monolito modular.

## 🎯 Estado del Proyecto

✅ **Funcionando correctamente**

- Servidor corriendo en puerto 3001
- Base de datos MongoDB configurada
- Redis para eventos en tiempo real
- API REST completamente funcional
- Arquitectura hexagonal implementada
- Módulos independientes (Producto, Inventario, Pedido)

## 🐳 Inicio Rápido con Docker (Recomendado)

### 1. Levantar servicios con Docker

```bash
# MongoDB
docker run --name mongodb-llm -p 27017:27017 -d mongo:latest

# Redis
docker run --name redis-llm -p 6379:6379 -d redis:7-alpine
```

## 💻 Inicio Rápido sin Docker (Instalación Local)

### 1. Instalar MongoDB y Redis localmente

**MongoDB:**
- Descargar desde: https://www.mongodb.com/try/download/community
- O con Chocolatey: `choco install mongodb`
- Iniciar servicio: `net start MongoDB`

**Redis (en WSL o Docker):**
```bash
# Opción 1: WSL
sudo apt install redis-server
sudo service redis-server start

# Opción 2: Docker (solo Redis)
docker run --name redis-llm -p 6379:6379 -d redis:7-alpine
```

### 2. Verificar que los servicios están corriendo

```bash
# MongoDB
mongosh --eval "db.version()"

# Redis
redis-cli ping
# Debe responder: PONG
```

## 🚀 Configuración del Proyecto (Ambos métodos)

### 1. Instalar dependencias de Node.js

```bash
npm install
```

## 🚀 Configuración del Proyecto (Ambos métodos)

### 1. Instalar dependencias de Node.js

```bash
npm install
```

### 2. Configurar variables de entorno

El archivo `.env` ya está configurado:

```env
# MongoDB (funciona tanto con Docker como local)
MONGO_URI=mongodb://localhost:27017
MONGO_DB=mojitobar

# Redis (funciona tanto con Docker como local)
REDIS_URL=redis://localhost:6379

# Servidor
PORT=3001
```

**Nota:** Si usas Redis en WSL, obtén la IP con `ip addr show eth0` y usa `redis://IP_WSL:6379`

### 3. Iniciar servidor

```bash
npm start
```

### 4. Verificar que funciona

```bash
curl http://localhost:3001/health
```

## 📦 Comandos Docker Útiles

```bash
# Ver contenedores corriendo
docker ps

# Ver logs de MongoDB
docker logs mongodb-llm

# Ver logs de Redis
docker logs redis-llm

# Detener contenedores
docker stop mongodb-llm redis-llm

# Iniciar contenedores detenidos
docker start mongodb-llm redis-llm

# Eliminar contenedores
docker rm -f mongodb-llm redis-llm

# Acceder a MongoDB shell
docker exec -it mongodb-llm mongosh

# Acceder a Redis CLI
docker exec -it redis-llm redis-cli
```

## 📁 Estructura del Proyecto

```
src/
├── modules/              # Módulos de negocio independientes
│   ├── inventario/       # Módulo de inventario
│   │   ├── domain/       # Entidades y puertos
│   │   ├── application/  # Casos de uso
│   │   └── infrastructure/ # Adaptadores (MongoDB)
│   ├── producto/         # Módulo de productos
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   └── pedido/           # Módulo de pedidos
│       ├── domain/
│       ├── application/
│       └── infrastructure/
├── shared/               # Infraestructura compartida
│   └── infrastructure/
│       ├── database/     # MongoDB client
│       ├── events/       # Redis client
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

- `GET /inventario` - Listar todos
- `GET /inventario/:id` - Obtener por ID
- `POST /inventario/actualizar` - Actualizar cantidad

### Pedidos

- `GET /pedido` - Listar todos
- `GET /pedido/:id` - Obtener por ID
- `POST /pedido` - Crear pedido
- `PATCH /pedido/:id/estado` - Actualizar estado

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
- **MongoDB** - Base de datos NoSQL (migrado desde PostgreSQL)
- **Socket.IO** - WebSockets para tiempo real
- **Redis** - Pub/Sub para eventos
- **Docker** - Contenedores para MongoDB y Redis

## 📊 Base de Datos MongoDB

```bash
# Conectar a MongoDB
docker exec -it mongodb-llm mongosh

# Comandos útiles en MongoDB
use mojitobar
db.productos.find()
db.inventario.find()
db.pedidos.find()

# Ver colecciones
show collections

# Contar documentos
db.productos.countDocuments()
```

## 🧪 Pruebas de Rendimiento con Locust

```bash
# Instalar Locust
pip install locust

# Ejecutar con interfaz web
locust -f locustfile.py
# Luego abrir http://localhost:8089

# Ejecutar desde línea de comandos
locust -f locustfile.py --headless --users 100 --spawn-rate 10 --host http://localhost:3001 --run-time 60s
```

## 🐛 Troubleshooting

Ver [SETUP.md](SETUP.md) para solución de problemas comunes.

## 📝 Ejemplos de Uso

```bash
# Crear producto
curl -X POST http://localhost:3001/producto \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mojito",
    "precio": 8.50,
    "categoria": "Cocteles",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 7
  }'

# Listar productos
curl http://localhost:3001/producto

# Actualizar inventario (activa notificación en tiempo real vía Redis/Socket.IO)
curl -X POST http://localhost:3001/inventario/actualizar \
  -H "Content-Type: application/json" \
  -d '{"inventarioId": "ID_AQUI", "cantidad": 100}'

# Crear pedido
curl -X POST http://localhost:3001/pedido \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "cliente_id": 2,
    "productos": [
      {"producto_id": "ID_PRODUCTO", "cantidad": 2}
    ]
  }'
```

## 🔄 Migración PostgreSQL → MongoDB

Esta rama implementa MongoDB en lugar de PostgreSQL. Características:

- ✅ Documentos flexibles en lugar de tablas relacionales
- ✅ IDs con ObjectId de MongoDB
- ✅ Adaptadores MongoDB implementan los mismos puertos
- ✅ Arquitectura hexagonal permite cambio de BD sin afectar lógica de negocio

## 📡 WebSocket en Tiempo Real

El proyecto incluye notificaciones en tiempo real usando Socket.IO + Redis:

1. Cuando se actualiza el inventario, se publica evento en Redis
2. Socket.IO escucha el evento de Redis
3. Todos los clientes conectados reciben la notificación instantáneamente

```javascript
// Conectar desde el navegador
const socket = io('http://localhost:3001');

socket.on('inventarioActualizado', (data) => {
  console.log('Inventario cambió:', data);
});
```

## 🎯 Demostración del Caso de Uso: ActualizarInventarioUseCase

Este es el caso de uso más completo que demuestra toda la arquitectura hexagonal.

### Paso 1: Obtener IDs de inventario disponibles

```bash
curl http://localhost:3001/inventario
```

Respuesta ejemplo:
```json
[
  {
    "id": "69249b5dce48ce53eafe6e16",
    "nombre": "Ron Havana Club",
    "cantidad_disponible": 5000,
    "unidad": "ml",
    "stock_minimo": 1000
  }
]
```

### Paso 2: Actualizar la cantidad del inventario

```bash
curl -X POST http://localhost:3001/inventario/actualizar -H "Content-Type: application/json" -d "{\"inventarioId\": \"69249b5dce48ce53eafe6e16\", \"cantidad\": 2000}"
```

Respuesta:
```json
{
  "mensaje": "Inventario actualizado",
  "data": {
    "id": "69249b5dce48ce53eafe6e16",
    "nombre": "Ron Havana Club",
    "cantidad_disponible": 3000,
    "unidad": "ml"
  }
}
```

### Paso 3: Verificar el cambio

```bash
curl http://localhost:3001/inventario/69249b5dce48ce53eafe6e16
```

### 📊 Lo que sucede internamente (Arquitectura Hexagonal):

```
1. HTTP Request (POST /inventario/actualizar)
   ↓
2. InventarioController (Infrastructure Layer)
   → Recibe y valida el request
   ↓
3. ActualizarInventarioUseCase (Application Layer)
   → Obtiene inventario actual desde MongoDB
   → Aplica lógica de dominio (actualizar cantidad)
   → Persiste cambios
   ↓
4. MongoInventarioRepository (Infrastructure - Adapter)
   → UPDATE en MongoDB: cantidad_disponible = 3000
   ↓
5. RedisEventPublisher (Infrastructure - Adapter)
   → PUBLISH 'inventario_actualizado' con datos del cambio
   ↓
6. Socket.IO Server (Infrastructure)
   → Escucha evento de Redis
   → Emite a TODOS los clientes WebSocket conectados
   ↓
7. Frontend (si está abierto)
   → Recibe notificación instantánea
   → Actualiza interfaz SIN recargar página
```

### 🌐 Demostración con Frontend en Tiempo Real

1. **Abrir el frontend:**
   ```
   C:\Users\Hp\Desktop\LLMEntrega3\FrontendMojitoBar\index.html
   ```

2. **Ejecutar el curl de actualización**

3. **Ver en el frontend:**
   - ✅ El inventario se actualiza automáticamente
   - ✅ Aparece en el log de eventos en tiempo real
   - ✅ Animación visual del cambio

### 🔍 Verificar en MongoDB

```bash
docker exec -it mongodb-llm mongosh
use mojitobar
db.inventario.find({"_id": ObjectId("69249b5dce48ce53eafe6e16")})
```

### 📋 Archivos involucrados en el Caso de Uso:

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| **Domain** | `Inventario.js` | Entidad con lógica de negocio |
| **Domain** | `InventarioRepository.js` | Puerto (interface) |
| **Domain** | `EventPublisher.js` | Puerto para eventos |
| **Application** | `ActualizarInventarioUseCase.js` | Orquestación del caso de uso |
| **Infrastructure** | `MongoInventarioRepository.js` | Adaptador MongoDB |
| **Infrastructure** | `RedisEventPublisher.js` | Adaptador Redis |
| **Infrastructure** | `InventarioController.js` | Adaptador HTTP |
| **Infrastructure** | `socketServer.js` | WebSocket en tiempo real |

Este caso de uso demuestra:
- ✅ **Separación de capas** (Domain, Application, Infrastructure)
- ✅ **Inversión de dependencias** (Domain no conoce MongoDB)
- ✅ **Puertos y Adaptadores** (Repository, EventPublisher)
- ✅ **Eventos asíncronos** (Redis Pub/Sub)
- ✅ **Comunicación en tiempo real** (Socket.IO)

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
**Base de Datos:** MongoDB (migrado desde PostgreSQL)  
**Eventos:** Redis Pub/Sub + Socket.IO  
**Estado:** ✅ Funcionando  
**Versión:** 2.0.0 (MongoDB Integration)
