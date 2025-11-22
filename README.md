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
