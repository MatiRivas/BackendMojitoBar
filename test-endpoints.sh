#!/bin/bash

# Script de prueba de endpoints - Mojito Bar
# Asegúrate de que el servidor esté corriendo en puerto 3000

BASE_URL="http://localhost:3000"

echo "========================================"
echo "🍹 MOJITO BAR - TEST DE ENDPOINTS"
echo "========================================"
echo ""

# Health Check
echo "✅ 1. Health Check"
curl -s $BASE_URL/health | jq .
echo -e "\n"

# Listar todos los productos
echo "✅ 2. Listar todos los productos"
curl -s $BASE_URL/producto | jq .
echo -e "\n"

# Obtener producto por ID
echo "✅ 3. Obtener producto por ID (Mojito)"
curl -s $BASE_URL/producto/1 | jq .
echo -e "\n"

# Crear nuevo producto
echo "✅ 4. Crear nuevo producto"
NUEVO_PRODUCTO=$(curl -s -X POST $BASE_URL/producto \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Margarita",
    "precio": 6800,
    "categoria": "Cocteles",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 5
  }')
echo $NUEVO_PRODUCTO | jq .
PRODUCTO_ID=$(echo $NUEVO_PRODUCTO | jq -r '.id')
echo -e "\n"

# Actualizar producto
echo "✅ 5. Actualizar precio del producto creado"
curl -s -X PUT $BASE_URL/producto/$PRODUCTO_ID \
  -H "Content-Type: application/json" \
  -d '{
    "precio": 7000,
    "disponibilidad": false
  }' | jq .
echo -e "\n"

# Obtener inventario
echo "✅ 6. Obtener inventario (Ron Blanco)"
curl -s $BASE_URL/inventario/1 | jq .
echo -e "\n"

# Actualizar inventario
echo "✅ 7. Actualizar cantidad de inventario"
curl -s -X POST $BASE_URL/inventario/actualizar \
  -H "Content-Type: application/json" \
  -d '{
    "inventarioId": 1,
    "cantidad": 4800
  }' | jq .
echo -e "\n"

# Ver inventario actualizado
echo "✅ 8. Verificar inventario actualizado"
curl -s $BASE_URL/inventario/1 | jq .
echo -e "\n"

# Eliminar producto creado
echo "✅ 9. Eliminar producto creado"
curl -s -X DELETE $BASE_URL/producto/$PRODUCTO_ID -w "\nHTTP Status: %{http_code}\n"
echo -e "\n"

# Casos de error
echo "❌ 10. Casos de Error"
echo "  - Producto no encontrado:"
curl -s $BASE_URL/producto/999 | jq .
echo ""
echo "  - Crear producto sin nombre:"
curl -s -X POST $BASE_URL/producto \
  -H "Content-Type: application/json" \
  -d '{"precio": 5000}' | jq .
echo ""
echo "  - Inventario no encontrado:"
curl -s $BASE_URL/inventario/999 | jq .
echo ""

echo "========================================"
echo "✅ PRUEBAS COMPLETADAS"
echo "========================================"
