# 🧾 Guía Completa: Cómo Crear Pedidos

## 📋 Endpoint Principal
```
POST http://localhost:3000/pedido
```

---

## 🎯 Flujo Completo de un Pedido

### 1. **Cliente llega al bar** → Crear Pedido

El mesero/cajero crea un pedido nuevo con los productos que el cliente solicita:

```bash
curl -X POST http://localhost:3000/pedido \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Respuesta:**
```json
{
  "id": 4,
  "estado": "pendiente",
  "total": 17500,
  "detalles": [...]
}
```

### 2. **Bartender recibe pedido** → Ver pedidos pendientes

El bartender consulta qué pedidos debe preparar:

```bash
curl "http://localhost:3000/pedido?estado=pendiente"
```

### 3. **Bartender empieza a preparar** → Actualizar a "preparando"

```bash
curl -X PATCH http://localhost:3000/pedido/4/estado \
  -H "Content-Type: application/json" \
  -d '{"estado": "preparando"}'
```

### 4. **Termina de preparar** → Actualizar a "listo"

```bash
curl -X PATCH http://localhost:3000/pedido/4/estado \
  -H "Content-Type: application/json" \
  -d '{"estado": "listo"}'
```

### 5. **Se entrega al cliente** → Actualizar a "entregado"

```bash
curl -X PATCH http://localhost:3000/pedido/4/estado \
  -H "Content-Type: application/json" \
  -d '{"estado": "entregado"}'
```

---

## 💡 Ejemplos de Casos de Uso

### Caso 1: Pedido Simple (Sin Cliente Registrado)

```bash
curl -X POST http://localhost:3000/pedido \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 2,
    "productos": [
      {"producto_id": 1, "cantidad": 1}
    ]
  }'
```

### Caso 2: Pedido con Cliente VIP Registrado

```bash
curl -X POST http://localhost:3000/pedido \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 2,
    "cliente_id": 1,
    "productos": [
      {"producto_id": 5, "cantidad": 2},
      {"producto_id": 7, "cantidad": 1}
    ]
  }'
```

### Caso 3: Pedido con Múltiples Productos

```bash
curl -X POST http://localhost:3000/pedido \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 2,
    "productos": [
      {"producto_id": 1, "cantidad": 3},
      {"producto_id": 2, "cantidad": 2},
      {"producto_id": 4, "cantidad": 1}
    ]
  }'
```

---

## 🔍 Consultas Útiles

### Ver todos los pedidos
```bash
curl http://localhost:3000/pedido
```

### Filtrar por estado
```bash
# Pedidos pendientes
curl "http://localhost:3000/pedido?estado=pendiente"

# Pedidos en preparación
curl "http://localhost:3000/pedido?estado=preparando"

# Pedidos listos
curl "http://localhost:3000/pedido?estado=listo"

# Pedidos entregados
curl "http://localhost:3000/pedido?estado=entregado"
```

### Ver detalle de un pedido específico
```bash
curl http://localhost:3000/pedido/4
```

---

## 📊 Estructura de Respuesta

### Crear Pedido - Respuesta Exitosa (201)
```json
{
  "id": 8,
  "cliente_id": 1,
  "usuario_id": 2,
  "estado": "pendiente",
  "total": 18500,
  "fecha_hora": "2025-11-23T20:15:00.000Z",
  "detalles": [
    {
      "id": 15,
      "pedido_id": 8,
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 6500,
      "subtotal": 13000,
      "productoNombre": "Mojito"
    },
    {
      "id": 16,
      "pedido_id": 8,
      "producto_id": 4,
      "cantidad": 1,
      "precio_unitario": 5500,
      "subtotal": 5500,
      "productoNombre": "Destornillador"
    }
  ]
}
```

---

## 🚀 Integración con Frontend (JavaScript/Fetch)

### Crear Pedido desde JavaScript

```javascript
async function crearPedido(usuarioId, productos) {
  try {
    const response = await fetch('http://localhost:3000/pedido', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario_id: usuarioId,
        productos: productos
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const pedido = await response.json();
    console.log('Pedido creado:', pedido);
    return pedido;
  } catch (error) {
    console.error('Error creando pedido:', error);
  }
}

// Uso
crearPedido(2, [
  { producto_id: 1, cantidad: 2 },
  { producto_id: 4, cantidad: 1 }
]);
```

### Actualizar Estado del Pedido

```javascript
async function actualizarEstado(pedidoId, nuevoEstado) {
  try {
    const response = await fetch(`http://localhost:3000/pedido/${pedidoId}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        estado: nuevoEstado
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const pedido = await response.json();
    console.log('Estado actualizado:', pedido);
    return pedido;
  } catch (error) {
    console.error('Error actualizando estado:', error);
  }
}

// Uso
actualizarEstado(4, 'preparando');
```

### Listar Pedidos Pendientes

```javascript
async function obtenerPedidosPendientes() {
  try {
    const response = await fetch('http://localhost:3000/pedido?estado=pendiente');
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const pedidos = await response.json();
    console.log('Pedidos pendientes:', pedidos);
    return pedidos;
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
  }
}
```

---

## 📝 Estados del Pedido

| Estado | Descripción |
|--------|-------------|
| `pendiente` | Pedido creado, esperando preparación |
| `preparando` | Bartender está preparando los tragos |
| `listo` | Pedido completado, esperando entrega |
| `entregado` | Pedido entregado al cliente |
| `cancelado` | Pedido cancelado |

---

## ✅ Campos Requeridos

### Para Crear un Pedido:
- ✅ `usuario_id` (number, requerido) - ID del mesero/cajero
- ✅ `productos` (array, requerido) - Mínimo 1 producto
  - ✅ `producto_id` (number, requerido)
  - ✅ `cantidad` (number, requerido)

### Campos Opcionales:
- `cliente_id` (number) - ID del cliente registrado

---

## ⚠️ Validaciones

1. ✅ El `usuario_id` debe existir en la tabla `usuario`
2. ✅ Cada `producto_id` debe existir y estar disponible
3. ✅ La `cantidad` debe ser mayor a 0
4. ✅ El sistema calcula automáticamente el `total` del pedido
5. ✅ Los precios se toman del producto al momento de crear el pedido

---

## 🎨 Ejemplo Completo de Flujo

```bash
# 1. Crear pedido
PEDIDO_ID=$(curl -s -X POST http://localhost:3000/pedido \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 2,
    "productos": [
      {"producto_id": 1, "cantidad": 2}
    ]
  }' | jq -r '.id')

echo "Pedido creado con ID: $PEDIDO_ID"

# 2. Actualizar a preparando
curl -X PATCH http://localhost:3000/pedido/$PEDIDO_ID/estado \
  -H "Content-Type: application/json" \
  -d '{"estado": "preparando"}'

# 3. Actualizar a listo
curl -X PATCH http://localhost:3000/pedido/$PEDIDO_ID/estado \
  -H "Content-Type: application/json" \
  -d '{"estado": "listo"}'

# 4. Actualizar a entregado
curl -X PATCH http://localhost:3000/pedido/$PEDIDO_ID/estado \
  -H "Content-Type: application/json" \
  -d '{"estado": "entregado"}'

# 5. Ver pedido final
curl http://localhost:3000/pedido/$PEDIDO_ID
```

---

## 🔗 Recursos Relacionados

- [ENDPOINTS.md](./ENDPOINTS.md) - Documentación completa de todos los endpoints
- [DATABASE_MODEL.md](./DATABASE_MODEL.md) - Modelo de datos y relaciones
- [ARQUITECTURA.md](./ARQUITECTURA.md) - Arquitectura hexagonal del proyecto
