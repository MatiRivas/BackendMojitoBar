#!/bin/bash

# Script de pruebas de carga con Locust
# Asegúrate de que el servidor esté corriendo antes de ejecutar

echo "🔥 Mojito Bar - Pruebas de Carga con Locust"
echo "============================================="
echo ""

# Verificar que el servidor esté corriendo
echo "📡 Verificando servidor..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Servidor activo en http://localhost:3000"
else
    echo "❌ Error: El servidor no está corriendo"
    echo "   Ejecuta: npm start"
    exit 1
fi

echo ""
echo "Selecciona el tipo de prueba:"
echo "1) Prueba ligera (10 usuarios, 2 usuarios/seg)"
echo "2) Prueba media (50 usuarios, 5 usuarios/seg)"
echo "3) Prueba pesada (100 usuarios, 10 usuarios/seg)"
echo "4) Prueba de estrés (200 usuarios, 20 usuarios/seg)"
echo "5) Modo interactivo (Web UI)"
echo ""
read -p "Opción (1-5): " opcion

case $opcion in
    1)
        echo "🚀 Ejecutando prueba LIGERA..."
        locust -f locustfile.py --headless \
            --users 10 \
            --spawn-rate 2 \
            --run-time 1m \
            --host http://localhost:3000 \
            --html report-light.html
        ;;
    2)
        echo "🚀 Ejecutando prueba MEDIA..."
        locust -f locustfile.py --headless \
            --users 50 \
            --spawn-rate 5 \
            --run-time 2m \
            --host http://localhost:3000 \
            --html report-medium.html
        ;;
    3)
        echo "🚀 Ejecutando prueba PESADA..."
        locust -f locustfile.py --headless \
            --users 100 \
            --spawn-rate 10 \
            --run-time 3m \
            --host http://localhost:3000 \
            --html report-heavy.html
        ;;
    4)
        echo "🚀 Ejecutando prueba de ESTRÉS..."
        locust -f locustfile.py --headless \
            --users 200 \
            --spawn-rate 20 \
            --run-time 5m \
            --host http://localhost:3000 \
            --html report-stress.html
        ;;
    5)
        echo "🌐 Abriendo interfaz web de Locust..."
        echo "   Accede a: http://localhost:8089"
        echo "   Host: http://localhost:3000"
        echo ""
        locust -f locustfile.py --host http://localhost:3000
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "✅ Prueba completada!"
if [ "$opcion" != "5" ]; then
    echo "📊 Reporte generado: report-*.html"
fi
