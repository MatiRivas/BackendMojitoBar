# 🚀 API Endpoints - Arquitectura Hexagonal

Base URL: `http://localhost:3000`

---

## 📋 Tabla de Contenidos

- [Health Check](#-health-check)
- [Productos](#-productos)
- [Inventario](#-inventario)
- [Ejemplos con cURL](#-ejemplos-con-curl)
- [Ejemplos con JavaScript/Fetch](#-ejemplos-con-javascriptfetch)
- [Códigos de respuesta](#-códigos-de-respuesta)

---

## 🏥 Health Check

### Verificar estado del servidor

```http
GET /health
```

**Respuesta exitosa (200):**
```json
{
  "status": "OK",
  "timestamp": "2025-11-22T16:30:00.000Z"
}
```

**Ejemplo:**
```bash
curl http://localhost:3000/health
```

---

## 📦 Productos

### 1. Listar todos los productos

```http
GET /producto
```

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre": "Café Americano",
    "precio": "2.50",
    "categoria": "Bebidas",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 5
  },
  {
    "id": 2,
    "nombre": "Cappuccino",
    "precio": "3.50",
    "categoria": "Bebidas",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 7
  }
]
```

**Ejemplo:**
```bash
curl http://localhost:3000/producto
```

---

### 2. Obtener producto por ID

```http
GET /producto/:id
```

**Parámetros:**
- `id` (number) - ID del producto

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "nombre": "Café Americano",
  "precio": "2.50",
  "categoria": "Bebidas",
  "disponibilidad": true,
  "tiempo_preparacion_estimado": 5
}
```

**Respuesta error (404):**
```json
{
  "error": "Producto con id 999 no encontrado"
}
```

**Ejemplos:**
```bash
# Obtener producto con ID 1
curl http://localhost:3000/producto/1

# Obtener producto con ID 2
curl http://localhost:3000/producto/2
```

---

### 3. Crear nuevo producto

```http
POST /producto
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nombre": "Café Latte",
  "precio": 3.75,
  "categoria": "Bebidas",
  "disponibilidad": true,
  "tiempo_preparacion_estimado": 6
}
```

**Campos:**
- `nombre` (string, requerido) - Nombre del producto
- `precio` (number, requerido) - Precio del producto (debe ser mayor a 0)
- `categoria` (string, opcional) - Categoría del producto
- `disponibilidad` (boolean, opcional) - Si está disponible (default: true)
- `tiempo_preparacion_estimado` (number, opcional) - Tiempo en minutos (default: 0)

**Respuesta exitosa (201):**
```json
{
  "id": 6,
  "nombre": "Café Latte",
  "precio": "3.75",
  "categoria": "Bebidas",
  "disponibilidad": true,
  "tiempo_preparacion_estimado": 6
}
```

**Respuesta error (400):**
```json
{
  "error": "El nombre del producto es requerido"
}
```

**Ejemplo:**
```bash
curl -X POST http://localhost:3000/producto \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Té Verde",
    "precio": 2.50,
    "categoria": "Bebidas",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 4
  }'
```

---

### 4. Actualizar producto

```http
PUT /producto/:id
Content-Type: application/json
```

**Parámetros:**
- `id` (number) - ID del producto a actualizar

**Body (JSON) - Todos los campos son opcionales:**
```json
{
  "nombre": "Café Americano Premium",
  "precio": 2.99,
  "categoria": "Bebidas Premium",
  "disponibilidad": false,
  "tiempo_preparacion_estimado": 8
}
```

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "nombre": "Café Americano Premium",
  "precio": "2.99",
  "categoria": "Bebidas Premium",
  "disponibilidad": false,
  "tiempo_preparacion_estimado": 8
}
```

**Respuesta error (404):**
```json
{
  "error": "Producto con id 999 no encontrado"
}
```

**Respuesta error (400):**
```json
{
  "error": "El precio debe ser mayor a cero"
}
```

**Ejemplos:**
```bash
# Actualizar solo el precio
curl -X PUT http://localhost:3000/producto/1 \
  -H "Content-Type: application/json" \
  -d '{"precio": 2.99}'

# Actualizar nombre y disponibilidad
curl -X PUT http://localhost:3000/producto/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Café Americano Grande",
    "disponibilidad": true
  }'

# Actualizar todos los campos
curl -X PUT http://localhost:3000/producto/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Espresso Doble",
    "precio": 4.50,
    "categoria": "Bebidas",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 10
  }'
```

---

### 5. Eliminar producto

```http
DELETE /producto/:id
```

**Parámetros:**
- `id` (number) - ID del producto a eliminar

**Respuesta exitosa (204):**
```
(Sin contenido)
```

**Respuesta error (404):**
```json
{
  "error": "Producto con id 999 no encontrado"
}
```

**Ejemplo:**
```bash
curl -X DELETE http://localhost:3000/producto/5
```

---

## 📊 Inventario

### 1. Obtener inventario por ID

```http
GET /inventario/:inventarioId
```

**Parámetros:**
- `inventarioId` (number) - ID del inventario

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "producto_id": 2,
  "cantidad": 100,
  "ubicacion": "Almacén Principal",
  "fecha_actualizacion": "2025-11-22T16:03:31.948Z"
}
```

**Respuesta error (404):**
```json
{
  "error": "Inventario con id 999 no encontrado"
}
```

**Ejemplos:**
```bash
# Obtener inventario con ID 1
curl http://localhost:3000/inventario/1

# Obtener inventario con ID 2
curl http://localhost:3000/inventario/2
```

---

### 2. Actualizar cantidad de inventario

```http
POST /inventario/actualizar
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "inventarioId": 1,
  "cantidad": 75
}
```

**Campos:**
- `inventarioId` (number, requerido) - ID del inventario
- `cantidad` (number, requerido) - Nueva cantidad (debe ser >= 0)

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Inventario actualizado",
  "data": {
    "id": 1,
    "producto_id": 2,
    "cantidad": 75,
    "ubicacion": "Almacén Principal",
    "fecha_actualizacion": "2025-11-22T16:30:00.000Z"
  }
}
```

**Respuesta error (400):**
```json
{
  "error": "inventarioId y cantidad son requeridos"
}
```

**Respuesta error (404):**
```json
{
  "error": "Inventario con id 999 no encontrado"
}
```

**Respuesta error (500):**
```json
{
  "error": "La cantidad no puede ser negativa"
}
```

**Ejemplos:**
```bash
# Actualizar a 50 unidades
curl -X POST http://localhost:3000/inventario/actualizar \
  -H "Content-Type: application/json" \
  -d '{
    "inventarioId": 1,
    "cantidad": 50
  }'

# Actualizar a 0 (agotado)
curl -X POST http://localhost:3000/inventario/actualizar \
  -H "Content-Type: application/json" \
  -d '{
    "inventarioId": 2,
    "cantidad": 0
  }'

# Aumentar inventario
curl -X POST http://localhost:3000/inventario/actualizar \
  -H "Content-Type: application/json" \
  -d '{
    "inventarioId": 1,
    "cantidad": 200
  }'
```

---

## 🧪 Ejemplos con cURL

### Script completo de pruebas

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "=== 1. Health Check ==="
curl $BASE_URL/health
echo -e "\n"

echo "=== 2. Listar productos ==="
curl $BASE_URL/producto
echo -e "\n"

echo "=== 3. Obtener producto 1 ==="
curl $BASE_URL/producto/1
echo -e "\n"

echo "=== 4. Crear nuevo producto ==="
curl -X POST $BASE_URL/producto \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mocha",
    "precio": 4.00,
    "categoria": "Bebidas",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 7
  }'
echo -e "\n"

echo "=== 5. Actualizar producto 1 ==="
curl -X PUT $BASE_URL/producto/1 \
  -H "Content-Type: application/json" \
  -d '{"precio": 2.75}'
echo -e "\n"

echo "=== 6. Obtener inventario 1 ==="
curl $BASE_URL/inventario/1
echo -e "\n"

echo "=== 7. Actualizar inventario ==="
curl -X POST $BASE_URL/inventario/actualizar \
  -H "Content-Type: application/json" \
  -d '{
    "inventarioId": 1,
    "cantidad": 60
  }'
echo -e "\n"

echo "=== 8. Eliminar producto 6 ==="
curl -X DELETE $BASE_URL/producto/6
echo -e "\n"
```

---

## 💻 Ejemplos con JavaScript/Fetch

### Health Check
```javascript
fetch('http://localhost:3000/health')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Listar productos
```javascript
fetch('http://localhost:3000/producto')
  .then(res => res.json())
  .then(productos => console.log(productos));
```

### Obtener producto por ID
```javascript
const productoId = 1;
fetch(`http://localhost:3000/producto/${productoId}`)
  .then(res => res.json())
  .then(producto => console.log(producto));
```

### Crear producto
```javascript
fetch('http://localhost:3000/producto', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Café Latte',
    precio: 3.75,
    categoria: 'Bebidas',
    disponibilidad: true,
    tiempo_preparacion_estimado: 6
  })
})
  .then(res => res.json())
  .then(producto => console.log('Producto creado:', producto));
```

### Actualizar producto
```javascript
const productoId = 1;
fetch(`http://localhost:3000/producto/${productoId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    precio: 2.99,
    disponibilidad: true
  })
})
  .then(res => res.json())
  .then(producto => console.log('Producto actualizado:', producto));
```

### Eliminar producto
```javascript
const productoId = 5;
fetch(`http://localhost:3000/producto/${productoId}`, {
  method: 'DELETE'
})
  .then(res => {
    if (res.status === 204) {
      console.log('Producto eliminado exitosamente');
    }
  });
```

### Obtener inventario
```javascript
const inventarioId = 1;
fetch(`http://localhost:3000/inventario/${inventarioId}`)
  .then(res => res.json())
  .then(inventario => console.log(inventario));
```

### Actualizar inventario
```javascript
fetch('http://localhost:3000/inventario/actualizar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    inventarioId: 1,
    cantidad: 75
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 📊 Códigos de respuesta

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa (GET, PUT) |
| 201 | Created | Recurso creado exitosamente (POST) |
| 204 | No Content | Recurso eliminado exitosamente (DELETE) |
| 400 | Bad Request | Datos inválidos o faltantes |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

## 🔧 Probar con herramientas GUI

### Postman / Insomnia / Thunder Client

1. **Crear nueva colección**: API Hexagonal
2. **Base URL**: `http://localhost:3000`
3. **Importar los endpoints** de este README

### Ejemplo de colección JSON para Postman:

```json
{
  "info": {
    "name": "API Hexagonal",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/health"
      }
    },
    {
      "name": "Listar Productos",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/producto"
      }
    },
    {
      "name": "Crear Producto",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"nombre\": \"Café Latte\",\n  \"precio\": 3.75,\n  \"categoria\": \"Bebidas\",\n  \"disponibilidad\": true,\n  \"tiempo_preparacion_estimado\": 6\n}"
        },
        "url": "http://localhost:3000/producto"
      }
    }
  ]
}
```

---

## 🚀 Iniciar servidor

```bash
# Limpiar puerto y iniciar
lsof -ti:3000 | xargs kill -9 2>/dev/null
npm run dev

# O usar el script
./start.sh
```

---

**Arquitectura:** Hexagonal + Monolito Modular  
**Versión:** 1.0.0  
**Puerto:** 3000
