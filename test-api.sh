#!/bin/bash

# Script de prueba de endpoints
# Uso: chmod +x test-api.sh && ./test-api.sh

BASE_URL="http://localhost:3000"

echo "========================================="
echo "🧪 Probando API - Arquitectura Hexagonal"
echo "========================================="
echo ""

echo "1️⃣  Health Check"
curl -s $BASE_URL/health | python3 -m json.tool
echo -e "\n"

echo "2️⃣  Listar Productos"
curl -s $BASE_URL/producto | python3 -m json.tool
echo -e "\n"

echo "3️⃣  Obtener Producto (ID: 1)"
curl -s $BASE_URL/producto/1 | python3 -m json.tool
echo -e "\n"

echo "4️⃣  Crear Nuevo Producto"
curl -s -X POST $BASE_URL/producto \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Latte",
    "precio": 3.75,
    "categoria": "Bebidas",
    "disponibilidad": true,
    "tiempo_preparacion_estimado": 6
  }' | python3 -m json.tool
echo -e "\n"

echo "5️⃣  Actualizar Producto (ID: 1)"
curl -s -X PUT $BASE_URL/producto/1 \
  -H "Content-Type: application/json" \
  -d '{
    "precio": 2.75,
    "disponibilidad": true
  }' | python3 -m json.tool
echo -e "\n"

echo "6️⃣  Obtener Inventario (ID: 1)"
curl -s $BASE_URL/inventario/1 | python3 -m json.tool
echo -e "\n"

echo "7️⃣  Actualizar Inventario"
curl -s -X POST $BASE_URL/inventario/actualizar \
  -H "Content-Type: application/json" \
  -d '{
    "inventarioId": 1,
    "cantidad": 50
  }' | python3 -m json.tool
echo -e "\n"

echo "8️⃣  Verificar Actualización"
curl -s $BASE_URL/inventario/1 | python3 -m json.tool
echo -e "\n"

echo "========================================="
echo "✅ Pruebas completadas"
echo "========================================="
