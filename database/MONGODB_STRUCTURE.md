# 🍃 Base de Datos MongoDB - Mojito Bar

## 📊 Arquitectura de Datos Embebidos

A diferencia del modelo relacional de PostgreSQL, MongoDB usa **documentos embebidos** para optimizar las consultas y evitar JOINs.

## 🗂️ Colecciones

### 1. **clientes**
Almacena información de los clientes del bar.

```javascript
{
  _id: ObjectId("..."),
  nombre: "Carlos Pérez",
  email: "carlos@email.com",
  telefono: "+56912345678",
  createdAt: ISODate("2025-11-24T10:30:00Z"),
  updatedAt: ISODate("2025-11-24T10:30:00Z")
}
```

**Índices:**
- `email` (unique, sparse)

---

### 2. **usuarios**
Personal del bar (admin, meseros, bartenders).

```javascript
{
  _id: ObjectId("..."),
  nombre: "Juan Mesero",
  email: "juan@mojitobar.com",
  clave: "$2b$10$abcdefghijk...",
  rol: "mesero", // admin | mesero | bartender
  activo: true,
  createdAt: ISODate("2025-11-24T10:30:00Z"),
  updatedAt: ISODate("2025-11-24T10:30:00Z")
}
```

**Índices:**
- `email` (unique)
- `rol`

---

### 3. **inventario**
Ingredientes disponibles (Ron, Coca-Cola, Limón, etc.).

```javascript
{
  _id: ObjectId("..."),
  nombre: "Ron Blanco",
  cantidadDisponible: 5000,
  unidad: "ml",
  tipo: "Licor",
  stockMinimo: 1000,
  createdAt: ISODate("2025-11-24T10:30:00Z"),
  updatedAt: ISODate("2025-11-24T10:30:00Z")
}
```

**Índices:**
- `nombre`
- `tipo`

---

### 4. **productos** 🔥
Tragos/bebidas del menú **CON INGREDIENTES EMBEBIDOS**.

```javascript
{
  _id: ObjectId("..."),
  nombre: "Mojito",
  precio: 6500,
  categoria: "Cocteles",
  disponibilidad: true,
  tiempoPreparacionEstimado: 5,
  descripcion: "Ron blanco, menta, limón, azúcar y agua con gas",
  imagenUrl: "",
  
  // ✨ INGREDIENTES EMBEBIDOS (Receta)
  ingredientes: [
    {
      id: ObjectId("..."), // Referencia al inventario
      nombre: "Ron Blanco",
      cantidadNecesaria: 50,
      unidad: "ml"
    },
    {
      id: ObjectId("..."),
      nombre: "Menta",
      cantidadNecesaria: 10,
      unidad: "hojas"
    },
    {
      id: ObjectId("..."),
      nombre: "Limón",
      cantidadNecesaria: 1,
      unidad: "unidades"
    },
    {
      id: ObjectId("..."),
      nombre: "Azúcar",
      cantidadNecesaria: 20,
      unidad: "gramos"
    },
    {
      id: ObjectId("..."),
      nombre: "Agua con Gas",
      cantidadNecesaria: 100,
      unidad: "ml"
    },
    {
      id: ObjectId("..."),
      nombre: "Hielo",
      cantidadNecesaria: 150,
      unidad: "gramos"
    }
  ],
  
  createdAt: ISODate("2025-11-24T10:30:00Z"),
  updatedAt: ISODate("2025-11-24T10:30:00Z")
}
```

**Índices:**
- `nombre`
- `categoria`
- `disponibilidad`

**Ventajas de embeber ingredientes:**
- ✅ Una sola consulta para ver la receta completa
- ✅ No necesitas JOIN
- ✅ Rendimiento superior al mostrar menú
- ✅ Mantiene historial de ingredientes aunque cambien

---

### 5. **pedidos** 🔥
Órdenes de clientes **CON DETALLES EMBEBIDOS**.

```javascript
{
  _id: ObjectId("..."),
  
  // ✨ CLIENTE EMBEBIDO (información desnormalizada)
  cliente: {
    id: ObjectId("..."), // Referencia
    nombre: "Carlos Pérez",
    email: "carlos@email.com",
    telefono: "+56912345678"
  },
  
  // ✨ USUARIO EMBEBIDO (quien atendió)
  usuario: {
    id: ObjectId("..."), // Referencia
    nombre: "Juan Mesero",
    rol: "mesero"
  },
  
  estado: "entregado", // pendiente | preparando | listo | entregado | cancelado
  total: 11000,
  fechaHora: ISODate("2025-11-24T14:30:00Z"),
  
  // ✨ DETALLES EMBEBIDOS (productos del pedido)
  detalles: [
    {
      productoId: ObjectId("..."),
      productoNombre: "Mojito",
      cantidad: 1,
      precioUnitario: 6500,
      subtotal: 6500
    },
    {
      productoId: ObjectId("..."),
      productoNombre: "Piscola",
      cantidad: 1,
      precioUnitario: 4500,
      subtotal: 4500
    }
  ],
  
  createdAt: ISODate("2025-11-24T14:30:00Z"),
  updatedAt: ISODate("2025-11-24T14:30:00Z")
}
```

**Índices:**
- `cliente.id`
- `usuario.id`
- `estado`
- `fechaHora` (descendente)

**Ventajas de embeber detalles:**
- ✅ Una sola consulta para obtener todo el pedido
- ✅ Historial inmutable (precios no cambian retroactivamente)
- ✅ Información completa sin JOINs
- ✅ Ideal para reportes y auditorías

---

## 🔍 Consultas Comunes

### Ver todos los productos con sus recetas
```javascript
db.productos.find()
```

### Ver receta de un producto específico
```javascript
db.productos.findOne({ nombre: "Mojito" })
```

### Ver todos los pedidos de un cliente
```javascript
db.pedidos.find({ "cliente.id": ObjectId("...") })
  .sort({ fechaHora: -1 })
```

### Ver pedidos pendientes
```javascript
db.pedidos.find({ estado: "pendiente" })
  .sort({ fechaHora: 1 })
```

### Inventario bajo stock
```javascript
db.inventario.find({
  $expr: { $lt: ["$cantidadDisponible", "$stockMinimo"] }
})
```

### Productos más vendidos
```javascript
db.pedidos.aggregate([
  { $unwind: "$detalles" },
  { 
    $group: {
      _id: "$detalles.productoNombre",
      totalVendido: { $sum: "$detalles.cantidad" },
      ingresos: { $sum: "$detalles.subtotal" }
    }
  },
  { $sort: { totalVendido: -1 } },
  { $limit: 10 }
])
```

### Ventas por mesero
```javascript
db.pedidos.aggregate([
  {
    $group: {
      _id: "$usuario.nombre",
      totalPedidos: { $sum: 1 },
      totalVentas: { $sum: "$total" }
    }
  },
  { $sort: { totalVentas: -1 } }
])
```

### Pedidos del día
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);

db.pedidos.find({
  fechaHora: { $gte: today }
}).sort({ fechaHora: -1 })
```

---

## 🔄 Migración desde PostgreSQL

Para migrar los datos existentes de PostgreSQL a MongoDB:

```bash
node database/migrate-postgres-to-mongo.js
```

Este script:
1. ✅ Lee todos los datos de PostgreSQL
2. ✅ Transforma las relaciones en documentos embebidos
3. ✅ Mapea los IDs de PostgreSQL a ObjectIds de MongoDB
4. ✅ Inserta los datos en MongoDB preservando las relaciones

---

## 📈 Comparación: PostgreSQL vs MongoDB

| Aspecto | PostgreSQL | MongoDB |
|---------|-----------|---------|
| **Esquema** | Rígido, tablas separadas | Flexible, documentos embebidos |
| **Relaciones** | JOINs entre tablas | Documentos embebidos o referencias |
| **Receta de producto** | Tabla `detalle_producto_inventario` | Array `ingredientes` en producto |
| **Pedido completo** | 3 tablas (pedido + detalle + producto) | 1 documento con todo embebido |
| **Consultas** | Múltiples JOINs | Una sola consulta |
| **Rendimiento lectura** | Más lento (JOINs) | Más rápido (documentos completos) |
| **Rendimiento escritura** | Más rápido (normalizado) | Similar (documentos embebidos) |
| **Escalabilidad** | Vertical | Horizontal |
| **Consistencia** | ACID garantizado | Eventual (configurable) |

---

## 🎯 Ventajas del Modelo Embebido

### 1. **Productos con ingredientes embebidos**
- Una sola consulta para ver toda la receta
- No hay sobrecarga de JOINs
- Historial de recetas preservado

### 2. **Pedidos con detalles embebidos**
- Todo el pedido en un solo documento
- Precios históricos inmutables
- Información de cliente/usuario desnormalizada para rapidez

### 3. **Rendimiento**
- Menos consultas a la base de datos
- Datos frecuentemente accedidos juntos están físicamente juntos
- Ideal para aplicaciones de lectura intensiva (menú, pedidos, reportes)

---

## 🚀 Próximos Pasos

1. ✅ Ejecutar migración de datos
2. ✅ Instalar MongoDB driver: `npm install`
3. ✅ Actualizar `.env` con credenciales MongoDB
4. ✅ Ejecutar servidor: `npm start`
5. ⏳ Crear módulos de Cliente y Usuario (falta implementar)
6. ⏳ Agregar autenticación JWT
7. ⏳ Implementar lógica de descuento automático de inventario
8. ⏳ Dashboard en tiempo real con WebSocket

---

## 🔧 Operaciones Útiles

### Insertar un nuevo producto
```javascript
db.productos.insertOne({
  nombre: "Pisco Sour",
  precio: 7500,
  categoria: "Cocteles",
  disponibilidad: true,
  tiempoPreparacionEstimado: 7,
  descripcion: "Pisco, limón, azúcar y clara de huevo",
  imagenUrl: "",
  ingredientes: [
    {
      id: ObjectId("..."), // ID del inventario de Pisco
      nombre: "Pisco",
      cantidadNecesaria: 60,
      unidad: "ml"
    },
    // ... más ingredientes
  ],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Actualizar inventario
```javascript
db.inventario.updateOne(
  { _id: ObjectId("...") },
  { 
    $inc: { cantidadDisponible: -50 },
    $set: { updatedAt: new Date() }
  }
)
```

### Cambiar estado de pedido
```javascript
db.pedidos.updateOne(
  { _id: ObjectId("...") },
  { 
    $set: { 
      estado: "preparando",
      updatedAt: new Date()
    }
  }
)
```

---

**Base de datos:** MongoDB  
**Versión:** 8.2.0  
**Modelo:** Documentos embebidos (desnormalizado)  
**Última actualización:** 24 Nov 2025
