# 🧪 Guía de Testing de Endpoints - MongoDB

## 🚀 Iniciar el Servidor

```bash
npm start
```

El servidor debería mostrar:
```
✅ Conectado a MongoDB: mojitobar
✅ Índices de MongoDB creados
🚀 Servidor ejecutándose en puerto 3001
```

---

## 📋 Endpoints Disponibles

### 1. Health Check
```bash
curl http://localhost:3001/health
```

---

## 🍹 Productos

### Listar todos los productos
```bash
curl http://localhost:3001/producto | jq
```

### Obtener un producto por ID
```bash
# Primero obtén un ID válido de la lista
curl http://localhost:3001/producto | jq '.[0]._id' -r

# Luego úsalo para obtener el producto
curl http://localhost:3001/producto/{ID_DEL_PRODUCTO} | jq
```

**Ejemplo:**
```bash
curl http://localhost:3001/producto/674398e7f8a1234567890abc | jq
```

### Crear un producto
```bash
curl -X POST http://localhost:3001/producto \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Cuba Libre",
    "precio": 5000,
    "categoria": "Tragos Largos",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 3,
    "descripcion": "Ron con Coca-Cola y limón"
  }' | jq
```

### Actualizar un producto
```bash
curl -X PUT http://localhost:3001/producto/{ID_DEL_PRODUCTO} \
  -H "Content-Type: application/json" \
  -d '{
    "precio": 5500,
    "disponibilidad": false
  }' | jq
```

### Eliminar un producto
```bash
curl -X DELETE http://localhost:3001/producto/{ID_DEL_PRODUCTO}
```

---

## 📦 Inventario

### Obtener un item de inventario
```bash
# Primero listar inventario desde MongoDB
# En terminal de mongo: db.inventario.find().pretty()

curl http://localhost:3001/inventario/{ID_DEL_INVENTARIO} | jq
```

### Actualizar inventario
```bash
curl -X PUT http://localhost:3001/inventario \
  -H "Content-Type: application/json" \
  -d '{
    "inventarioId": "{ID_DEL_INVENTARIO}",
    "cantidad": 3000
  }' | jq
```

---

## 🧾 Pedidos

### Listar todos los pedidos
```bash
curl http://localhost:3001/pedido | jq
```

### Filtrar pedidos por estado
```bash
curl "http://localhost:3001/pedido?estado=pendiente" | jq
curl "http://localhost:3001/pedido?estado=preparando" | jq
curl "http://localhost:3001/pedido?estado=entregado" | jq
```

### Obtener un pedido por ID
```bash
curl http://localhost:3001/pedido/{ID_DEL_PEDIDO} | jq
```

### Crear un pedido
```bash
# Primero obtén IDs de productos y usuario
PRODUCTO_ID=$(curl -s http://localhost:3001/producto | jq -r '.[0].id')
USUARIO_ID=$(echo "db.usuarios.findOne()" | mongosh mojitobar --quiet | grep -o '"_id"[^,]*' | cut -d'"' -f4)

curl -X POST http://localhost:3001/pedido \
  -H "Content-Type: application/json" \
  -d "{
    \"usuario_id\": \"$USUARIO_ID\",
    \"cliente_id\": null,
    \"productos\": [
      {
        \"producto_id\": \"$PRODUCTO_ID\",
        \"cantidad\": 2
      }
    ]
  }" | jq
```

**Ejemplo manual:**
```bash
curl -X POST http://localhost:3001/pedido \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": "674398e7f8a1234567890def",
    "productos": [
      {
        "producto_id": "674398e7f8a1234567890abc",
        "cantidad": 2
      },
      {
        "producto_id": "674398e7f8a1234567890bcd",
        "cantidad": 1
      }
    ]
  }' | jq
```

### Actualizar estado de un pedido
```bash
curl -X PATCH http://localhost:3001/pedido/{ID_DEL_PEDIDO}/estado \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "preparando"
  }' | jq
```

**Estados válidos:**
- `pendiente`
- `preparando`
- `listo`
- `entregado`
- `cancelado`

---

## 🔍 Consultas Útiles en MongoDB

### Conectar a MongoDB Shell
```bash
mongosh mojitobar
```

### Ver todos los productos
```javascript
db.productos.find().pretty()
```

### Ver productos con ingredientes
```javascript
db.productos.findOne({ nombre: "Mojito" })
```

### Ver todos los pedidos con detalles embebidos
```javascript
db.pedidos.find().pretty()
```

### Ver pedidos de hoy
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);
db.pedidos.find({ fechaHora: { $gte: today } }).pretty()
```

### Ver inventario bajo stock
```javascript
db.inventario.find({
  $expr: { $lt: ["$cantidadDisponible", "$stockMinimo"] }
}).pretty()
```

### Contar documentos
```javascript
db.productos.countDocuments()
db.pedidos.countDocuments()
db.inventario.countDocuments()
```

---

## 🧪 Script de Testing Completo

```bash
#!/bin/bash

echo "🧪 Testing Endpoints - MongoDB"
echo "=============================="

# Health check
echo -e "\n✅ Health Check:"
curl -s http://localhost:3001/health | jq

# Productos
echo -e "\n📋 Listar productos:"
curl -s http://localhost:3001/producto | jq '. | length'

echo -e "\n🍹 Primer producto:"
PRODUCTO_ID=$(curl -s http://localhost:3001/producto | jq -r '.[0].id')
echo "ID: $PRODUCTO_ID"
curl -s http://localhost:3001/producto/$PRODUCTO_ID | jq '.nombre'

# Pedidos
echo -e "\n📦 Listar pedidos:"
curl -s http://localhost:3001/pedido | jq '. | length'

echo -e "\n✅ Tests completados!"
```

Guarda este script como `test-mongo-api.sh` y ejecútalo:
```bash
chmod +x test-mongo-api.sh
./test-mongo-api.sh
```

---

## ⚠️ Diferencias con PostgreSQL

| Aspecto | PostgreSQL | MongoDB |
|---------|-----------|---------|
| **IDs** | Números enteros (1, 2, 3...) | ObjectId strings (24 caracteres hex) |
| **Formato ID** | `"id": 1` | `"id": "674398e7f8a1234567890abc"` |
| **Validación** | `parseInt(id)` | `ObjectId.isValid(id)` |
| **Pedidos** | 3 consultas (pedido + detalle + producto) | 1 consulta (todo embebido) |
| **Ingredientes** | Tabla separada | Array embebido en producto |

---

## 🚨 Errores Comunes

### Error: "Producto con id X no encontrado"
- ✅ Verifica que el ID sea un ObjectId válido de 24 caracteres
- ✅ No uses IDs numéricos (1, 2, 3)
- ✅ Copia el ID exacto desde la respuesta de la API

### Error: "inventarioId es requerido"
- ✅ Asegúrate de enviar el campo en el body del request
- ✅ Usa el formato correcto: `{"inventarioId": "...", "cantidad": 100}`

### Error: "Cannot connect to MongoDB"
- ✅ Verifica que MongoDB esté corriendo: `brew services list`
- ✅ Verifica el .env: `MONGO_URI=mongodb://localhost:27017`

---

## 📊 Verificar Datos Migrados

```bash
# Contar documentos
echo "use mojitobar" | mongosh --quiet --eval "
  print('Productos:', db.productos.countDocuments());
  print('Pedidos:', db.pedidos.countDocuments());
  print('Inventario:', db.inventario.countDocuments());
  print('Clientes:', db.clientes.countDocuments());
  print('Usuarios:', db.usuarios.countDocuments());
"
```

---

**Última actualización:** 24 Nov 2025
