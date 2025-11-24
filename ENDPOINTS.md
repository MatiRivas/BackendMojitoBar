# 🚀 API Endpoints - Arquitectura Hexagonal

Base URL: `http://localhost:3000`

---

## 📋 Tabla de Contenidos

- [Health Check](#-health-check)
- [Productos](#-productos)
- [Inventario](#-inventario)
- [Pedidos](#-pedidos)
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
    "nombre": "Mojito",
    "precio": 6500,
    "categoria": "Cocteles",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 5
  },
  {
    "id": 2,
    "nombre": "Piscola",
    "precio": 4500,
    "categoria": "Tragos Largos",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 2
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
  "nombre": "Mojito",
  "precio": 6500,
  "categoria": "Cocteles",
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
  "nombre": "Cuba Libre",
  "precio": 5000,
  "categoria": "Tragos Largos",
  "disponibilidad": true,
  "tiempo_preparacion_estimado": 3
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
  "id": 8,
  "nombre": "Cuba Libre",
  "precio": 5000,
  "categoria": "Tragos Largos",
  "disponibilidad": true,
  "tiempo_preparacion_estimado": 3
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
    "nombre": "Margarita",
    "precio": 6800,
    "categoria": "Cocteles",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 5
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
  "nombre": "Mojito Premium",
  "precio": 7500,
  "categoria": "Cocteles Premium",
  "disponibilidad": false,
  "tiempo_preparacion_estimado": 8
}
```

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "nombre": "Mojito Premium",
  "precio": 7500,
  "categoria": "Cocteles Premium",
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
  -d '{"precio": 7000}'

# Actualizar nombre y disponibilidad
curl -X PUT http://localhost:3000/producto/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mojito Especial",
    "disponibilidad": true
  }'

# Actualizar todos los campos
curl -X PUT http://localhost:3000/producto/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mojito Premium",
    "precio": 7500,
    "categoria": "Cocteles",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 6
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
  "nombre": "Ron Blanco",
  "cantidad_disponible": 5000,
  "unidad": "ml",
  "tipo": "Licor",
  "stock_minimo": 1000
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
    "nombre": "Ron Blanco",
    "cantidad_disponible": 4500,
    "unidad": "ml",
    "tipo": "Licor",
    "stock_minimo": 1000
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
    "cantidad": 4500
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
    "cantidad": 6000
  }'
```

---

## 🧾 Pedidos

### 1. Crear nuevo pedido

```http
POST /pedido
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "usuario_id": 2,
  "cliente_id": 1,
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 2
    },
    {
      "producto_id": 2,
      "cantidad": 1
    }
  ]
}
```

**Campos:**
- `usuario_id` (number, requerido) - ID del usuario que registra el pedido
- `cliente_id` (number, opcional) - ID del cliente
- `productos` (array, requerido) - Lista de productos a pedir
  - `producto_id` (number, requerido) - ID del producto
  - `cantidad` (number, requerido) - Cantidad del producto

**Respuesta exitosa (201):**
```json
{
  "id": 4,
  "cliente_id": 1,
  "usuario_id": 2,
  "estado": "pendiente",
  "total": 17500,
  "fecha_hora": "2025-11-24T02:30:00.000Z",
  "detalles": [
    {
      "id": 7,
      "pedido_id": 4,
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 6500,
      "subtotal": 13000
    },
    {
      "id": 8,
      "pedido_id": 4,
      "producto_id": 2,
      "cantidad": 1,
      "precio_unitario": 4500,
      "subtotal": 4500
    }
  ]
}
```

**Respuesta error (400):**
```json
{
  "error": "El usuario_id es requerido"
}
```

**Ejemplo:**
```bash
curl -X POST http://localhost:3000/pedido \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 2,
    "productos": [
      {"producto_id": 1, "cantidad": 2},
      {"producto_id": 2, "cantidad": 1}
    ]
  }'
```

---

### 2. Listar todos los pedidos

```http
GET /pedido
```

**Query Parameters (opcionales):**
- `estado` (string) - Filtrar por estado: `pendiente`, `preparando`, `listo`, `entregado`, `cancelado`

**Respuesta exitosa (200):**
```json
[
  {
    "id": 4,
    "cliente_id": 1,
    "usuario_id": 2,
    "estado": "pendiente",
    "total": 17500,
    "fecha_hora": "2025-11-24T02:30:00.000Z",
    "detalles": [],
    "clienteNombre": "Carlos Pérez",
    "usuarioNombre": "Juan Mesero"
  }
]
```

**Ejemplos:**
```bash
# Listar todos los pedidos
curl http://localhost:3000/pedido

# Listar solo pedidos pendientes
curl "http://localhost:3000/pedido?estado=pendiente"

# Listar pedidos en preparación
curl "http://localhost:3000/pedido?estado=preparando"
```

---

### 3. Obtener pedido por ID

```http
GET /pedido/:id
```

**Parámetros:**
- `id` (number) - ID del pedido

**Respuesta exitosa (200):**
```json
{
  "id": 4,
  "cliente_id": 1,
  "usuario_id": 2,
  "estado": "pendiente",
  "total": 17500,
  "fecha_hora": "2025-11-24T02:30:00.000Z",
  "detalles": [
    {
      "id": 7,
      "pedido_id": 4,
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 6500,
      "subtotal": 13000,
      "productoNombre": "Mojito"
    },
    {
      "id": 8,
      "pedido_id": 4,
      "producto_id": 2,
      "cantidad": 1,
      "precio_unitario": 4500,
      "subtotal": 4500,
      "productoNombre": "Piscola"
    }
  ]
}
```

**Respuesta error (404):**
```json
{
  "error": "Pedido con id 999 no encontrado"
}
```

**Ejemplo:**
```bash
curl http://localhost:3000/pedido/4
```

---

### 4. Actualizar estado del pedido

```http
PATCH /pedido/:id/estado
Content-Type: application/json
```

**Parámetros:**
- `id` (number) - ID del pedido

**Body (JSON):**
```json
{
  "estado": "preparando"
}
```

**Estados válidos:**
- `pendiente` - Pedido recibido, esperando preparación
- `preparando` - Bartender está preparando los tragos
- `listo` - Pedido listo para entrega
- `entregado` - Pedido entregado al cliente
- `cancelado` - Pedido cancelado

**Respuesta exitosa (200):**
```json
{
  "id": 4,
  "cliente_id": 1,
  "usuario_id": 2,
  "estado": "preparando",
  "total": 17500,
  "fecha_hora": "2025-11-24T02:30:00.000Z",
  "detalles": []
}
```

**Respuesta error (400):**
```json
{
  "error": "Estado inválido: invalido"
}
```

**Ejemplos:**
```bash
# Marcar como preparando
curl -X PATCH http://localhost:3000/pedido/4/estado \
  -H "Content-Type: application/json" \
  -d '{"estado": "preparando"}'

# Marcar como listo
curl -X PATCH http://localhost:3000/pedido/4/estado \
  -H "Content-Type: application/json" \
  -d '{"estado": "listo"}'

# Marcar como entregado
curl -X PATCH http://localhost:3000/pedido/4/estado \
  -H "Content-Type: application/json" \
  -d '{"estado": "entregado"}'
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
    "nombre": "Margarita",
    "precio": 6800,
    "categoria": "Cocteles",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 5
  }'
echo -e "\n"

echo "=== 5. Actualizar producto 1 ==="
curl -X PUT $BASE_URL/producto/1 \
  -H "Content-Type: application/json" \
  -d '{"precio": 7000}'
echo -e "\n"

echo "=== 6. Obtener inventario 1 ==="
curl $BASE_URL/inventario/1
echo -e "\n"

echo "=== 7. Actualizar inventario ==="
curl -X POST $BASE_URL/inventario/actualizar \
  -H "Content-Type: application/json" \
  -d '{
    "inventarioId": 1,
    "cantidad": 4800
  }'
echo -e "\n"

echo "=== 8. Eliminar producto 8 ==="
curl -X DELETE $BASE_URL/producto/8
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
    nombre: 'Margarita',
    precio: 6800,
    categoria: 'Cocteles',
    disponibilidad: true,
    tiempo_preparacion_estimado: 5
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
    precio: 7000,
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
    cantidad: 4500
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
    "name": "Mojito Bar API",
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
          "raw": "{\n  \"nombre\": \"Margarita\",\n  \"precio\": 6800,\n  \"categoria\": \"Cocteles\",\n  \"disponibilidad\": true,\n  \"tiempo_preparacion_estimado\": 5\n}"
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
