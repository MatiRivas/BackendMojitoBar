# Guía de Configuración y Ejecución

## 📋 Prerequisitos

- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- Redis (opcional, para eventos en tiempo real)

## 🚀 Pasos para configurar el proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar PostgreSQL

#### Opción A: Usar PostgreSQL local

```bash
# Iniciar PostgreSQL (macOS con Homebrew)
brew services start postgresql@14

# Crear base de datos
createdb llm

# O usando psql
psql postgres
CREATE DATABASE llm;
\q
```

#### Opción B: Usar Docker

```bash
docker run --name postgres-llm \
  -e POSTGRES_USER=chupacarrillo \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=llm \
  -p 5432:5432 \
  -d postgres:14
```

### 3. Ejecutar el schema de base de datos

```bash
# Con psql
psql -U chupacarrillo -d llm -f database/schema.sql

# O si tienes contraseña
psql -U chupacarrillo -d llm -W -f database/schema.sql

# Con Docker
docker exec -i postgres-llm psql -U chupacarrillo -d llm < database/schema.sql
```

### 4. Configurar variables de entorno

Edita el archivo `.env`:

```env
# PostgreSQL (REQUERIDO)
PG_USER=chupacarrillo
PG_PASSWORD=tu_password_aqui
PG_HOST=localhost
PG_PORT=5432
PG_DB=llm

# Redis (OPCIONAL - para eventos en tiempo real)
REDIS_URL=redis://localhost:6379

# Servidor
PORT=3000
```

### 5. (Opcional) Configurar Redis

#### Con Homebrew (macOS)
```bash
brew install redis
brew services start redis
```

#### Con Docker
```bash
docker run --name redis-llm \
  -p 6379:6379 \
  -d redis:7-alpine
```

**Nota:** Si no configuras Redis, el sistema funcionará sin eventos en tiempo real.

### 6. Iniciar el servidor

```bash
# Modo producción
npm start

# Modo desarrollo (con hot-reload)
npm run dev
```

Deberías ver:
```
🚀 Servidor ejecutándose en puerto 3000
📦 Arquitectura: Hexagonal + Monolito Modular
📁 Módulos: Inventario, Producto
```

## 🧪 Probar la API

### Health Check
```bash
curl http://localhost:3000/health
```

### Productos

```bash
# Listar todos los productos
curl http://localhost:3000/producto

# Obtener producto por ID
curl http://localhost:3000/producto/1

# Crear producto
curl -X POST http://localhost:3000/producto \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Té Verde",
    "precio": 2.00,
    "categoria": "Bebidas",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 4
  }'

# Actualizar producto
curl -X PUT http://localhost:3000/producto/1 \
  -H "Content-Type: application/json" \
  -d '{
    "precio": 2.75,
    "disponibilidad": true
  }'

# Eliminar producto
curl -X DELETE http://localhost:3000/producto/1
```

### Inventario

```bash
# Obtener inventario por ID
curl http://localhost:3000/inventario/1

# Actualizar cantidad de inventario
curl -X POST http://localhost:3000/inventario/actualizar \
  -H "Content-Type: application/json" \
  -d '{
    "inventarioId": 1,
    "cantidad": 75
  }'
```

## 🐛 Solución de Problemas

### Error: "Connection refused" PostgreSQL

```bash
# Verificar que PostgreSQL está corriendo
pg_isready

# O revisar el estado del servicio
brew services list | grep postgresql
```

### Error: "Database does not exist"

```bash
# Crear la base de datos
createdb llm

# O con psql
psql postgres -c "CREATE DATABASE llm;"
```

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Redis no conecta (Warning)

Si ves el warning `REDIS_URL no configurado`, es normal si no tienes Redis. El sistema funcionará sin eventos en tiempo real.

Para habilitar Redis:
1. Instala y ejecuta Redis
2. Agrega `REDIS_URL=redis://localhost:6379` al archivo `.env`
3. Reinicia el servidor

## 📊 Verificar Base de Datos

```bash
# Conectar a la base de datos
psql -U chupacarrillo -d llm

# Ver tablas
\dt

# Ver productos
SELECT * FROM producto;

# Ver inventario
SELECT * FROM inventario;

# Salir
\q
```

## 🧪 Ejecutar Tests

```bash
npm test
```

## 🔄 Reiniciar Base de Datos

Si necesitas empezar de cero:

```bash
# Eliminar y recrear
dropdb llm
createdb llm
psql -U chupacarrillo -d llm -f database/schema.sql
```

## 📝 Estructura de Respuestas

### Producto
```json
{
  "id": 1,
  "nombre": "Café Americano",
  "precio": 2.50,
  "categoria": "Bebidas",
  "disponibilidad": true,
  "tiempo_preparacion_estimado": 5
}
```

### Inventario
```json
{
  "id": 1,
  "producto_id": 1,
  "cantidad": 100,
  "ubicacion": "Almacén Principal",
  "fecha_actualizacion": "2025-11-22T10:30:00.000Z"
}
```

## 🎯 Próximos Pasos

1. Implementar autenticación (JWT)
2. Agregar validaciones más robustas
3. Implementar caché con Redis
4. Crear más tests unitarios e integración
5. Agregar logging estructurado
6. Implementar rate limiting
7. Agregar documentación con Swagger/OpenAPI
