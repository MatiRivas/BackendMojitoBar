# 🦗 Guía de Pruebas de Carga con Locust

## 📋 Requisitos Previos

1. **Python 3.7+** instalado
2. **Locust** instalado
3. **Servidor de la API** corriendo en `http://localhost:3000`

## 🚀 Instalación

### Opción 1: Con pip (recomendado)
```bash
pip install locust
```

### Opción 2: Con pip3
```bash
pip3 install locust
```

### Verificar instalación
```bash
locust --version
```

Deberías ver algo como: `locust 2.x.x from ...`

---

## 🎯 Cómo Usar Locust

### Paso 1: Asegúrate de que tu API esté corriendo

```bash
# En una terminal
npm run dev
```

Verifica que esté funcionando:
```bash
curl http://localhost:3000/health
```

### Paso 2: Iniciar Locust

```bash
# En otra terminal, desde la raíz del proyecto
locust
```

O si quieres especificar el archivo:
```bash
locust -f locustfile.py
```

Deberías ver:
```
[2025-11-24 10:30:00,000] Starting web interface at http://0.0.0.0:8089
[2025-11-24 10:30:00,001] Starting Locust 2.x.x
```

### Paso 3: Abrir la interfaz web

1. Abre tu navegador
2. Ve a: **http://localhost:8089**
3. Verás la interfaz de Locust

---

## 🎮 Configuración de Pruebas en la UI

### Parámetros a configurar:

1. **Number of users (peak concurrency)**
   - Ejemplo: `10` - `100` usuarios simultáneos
   - Recomendado empezar con 10

2. **Ramp up (users started/second)**
   - Ejemplo: `2` - `10` usuarios por segundo
   - Recomendado empezar con 2

3. **Host**
   - Dejar: `http://localhost:3000`
   - Ya está configurado en el archivo

4. **Click en "Start swarming"**

---

## 📊 Interpretando los Resultados

### Métricas Principales

#### 1. **Statistics Tab (Estadísticas)**
- **Type**: Tipo de request (GET, POST, etc.)
- **Name**: Endpoint probado
- **# Requests**: Número total de requests
- **# Fails**: Número de fallos
- **Median (ms)**: Tiempo de respuesta mediano
- **95%ile (ms)**: 95% de requests más rápidos que este tiempo
- **Average (ms)**: Tiempo promedio de respuesta
- **Min/Max (ms)**: Tiempos mínimo y máximo
- **RPS**: Requests por segundo

#### 2. **Charts Tab (Gráficos)**
- **Total Requests per Second**: Throughput de la API
- **Response Times**: Tiempo de respuesta en el tiempo
- **Number of Users**: Usuarios activos

#### 3. **Failures Tab**
- Muestra todos los errores encontrados
- Útil para debugging

#### 4. **Exceptions Tab**
- Excepciones del código
- Errores no manejados

#### 5. **Current Ratio**
- Distribución de las diferentes tareas

---

## 🎯 Configuraciones de Prueba Recomendadas

### 🟢 Prueba Ligera (Desarrollo)
```
Users: 10
Ramp up: 2 users/second
Duración: 1-2 minutos
```
**Objetivo**: Verificar que todo funciona

### 🟡 Prueba Media (Testing)
```
Users: 50
Ramp up: 5 users/second
Duración: 5 minutos
```
**Objetivo**: Encontrar problemas de rendimiento

### 🔴 Prueba de Estrés (Pre-producción)
```
Users: 100-200
Ramp up: 10 users/second
Duración: 10 minutos
```
**Objetivo**: Encontrar límites del sistema

### 💥 Prueba de Rotura
```
Users: 500+
Ramp up: 20 users/second
Duración: 5 minutos
```
**Objetivo**: Romper el sistema y ver dónde falla

---

## 📈 Qué Buscar en los Resultados

### ✅ Buenas Señales
- **Failure rate < 1%**
- **Response time mediano < 100ms**
- **95 percentil < 500ms**
- **RPS estable**
- **Sin errores 500**

### ⚠️ Señales de Advertencia
- **Failure rate 1-5%**
- **Response time creciente con el tiempo**
- **95 percentil > 1000ms**
- **Errores 500 ocasionales**

### 🚨 Problemas Serios
- **Failure rate > 5%**
- **Response time > 2000ms**
- **Muchos errores 500**
- **Sistema crashea**
- **RPS decreciente bajo carga constante**

---

## 🔧 Tareas Configuradas

El archivo `locustfile.py` tiene dos tipos de usuarios:

### 1. **MojitoBarUser** (Usuario Normal) - 90% del tráfico

| Tarea | Peso | Frecuencia |
|-------|------|------------|
| Health Check | 10 | Muy Alta |
| Listar Productos | 5 | Alta |
| Listar Pedidos | 4 | Alta |
| Obtener Producto | 3 | Media |
| Consultar Inventario | 2 | Media |
| Obtener Pedido | 2 | Media |
| Crear Pedido | 1 | Baja |
| Crear Producto | 1 | Baja |
| Actualizar Producto | 1 | Baja |
| Actualizar Estado Pedido | 1 | Baja |
| Actualizar Inventario | 1 | Baja |

### 2. **AdminUser** (Administrador) - 10% del tráfico

| Tarea | Peso | Descripción |
|-------|------|-------------|
| Crear Productos Masivo | 2 | Crea 3 productos |
| Ver Todos Pedidos | 1 | Sin filtros |
| Actualizar Inventarios | 1 | Actualiza 4 inventarios |

---

## 🎨 Personalizar las Pruebas

### Cambiar la distribución de tareas

Edita los pesos en `locustfile.py`:

```python
@task(10)  # Mayor número = más frecuente
def mi_tarea(self):
    ...

@task(1)   # Menor número = menos frecuente
def otra_tarea(self):
    ...
```

### Cambiar el tiempo de espera entre requests

```python
# Esperar entre 1 y 3 segundos
wait_time = between(1, 3)

# Sin espera
wait_time = constant(0)

# Espera fija de 2 segundos
wait_time = constant(2)
```

### Añadir nuevos endpoints

```python
@task(5)
def mi_nuevo_endpoint(self):
    with self.client.get("/mi-endpoint", catch_response=True) as response:
        if response.status_code == 200:
            response.success()
        else:
            response.failure(f"Error {response.status_code}")
```

---

## 📝 Modo Headless (Sin interfaz web)

Útil para CI/CD o scripts automatizados:

```bash
# Ejecutar sin UI
locust --headless --users 10 --spawn-rate 2 --run-time 1m

# Guardar estadísticas en CSV
locust --headless --users 50 --spawn-rate 5 --run-time 5m \
  --csv=resultados --html=reporte.html

# Con host específico
locust --headless --users 100 --spawn-rate 10 --run-time 2m \
  --host http://localhost:3000
```

Esto generará:
- `resultados_stats.csv`
- `resultados_failures.csv`
- `resultados_stats_history.csv`
- `reporte.html`

---

## 🐛 Troubleshooting

### Problema: "Connection refused"
```bash
# Verificar que la API está corriendo
curl http://localhost:3000/health

# Si no responde, iniciar la API
npm run dev
```

### Problema: "Address already in use" en Locust
```bash
# El puerto 8089 está ocupado, usar otro puerto
locust --web-port 8090
```

### Problema: Muchos errores 500
```bash
# Ver logs del servidor
# La API muestra los errores en la terminal donde corre
```

### Problema: Locust muy lento
```bash
# Reducir número de usuarios
# O aumentar el wait_time en locustfile.py
```

---

## 📦 Exportar Resultados

### Durante la prueba:
1. Click en "Download Data" → "Download statistics as CSV"
2. Click en "Download Data" → "Download report as HTML"

### Desde la línea de comandos:
```bash
locust --headless --users 50 --spawn-rate 5 --run-time 5m \
  --csv=resultados \
  --html=reporte.html
```

---

## 🎯 Ejemplo de Flujo Completo

### Terminal 1: Iniciar la API
```bash
cd /Users/chupacarrillo/Desktop/LLM
npm run dev
```

### Terminal 2: Iniciar Locust
```bash
cd /Users/chupacarrillo/Desktop/LLM
locust
```

### Navegador:
1. Ir a http://localhost:8089
2. Configurar:
   - Users: 20
   - Ramp up: 2
3. Click "Start swarming"
4. Observar por 2-3 minutos
5. Click "Stop"
6. Revisar estadísticas
7. Descargar reporte

---

## 📊 Comandos Útiles

```bash
# Ver ayuda
locust --help

# Versión
locust --version

# Puerto personalizado
locust --web-port 8090

# Listar todas las tareas
locust --list

# Modo distribuido (múltiples máquinas)
# Máquina master
locust --master

# Máquinas workers
locust --worker --master-host=192.168.1.100
```

---

## 🎓 Tips y Mejores Prácticas

### ✅ Hacer
- Empezar con pocas usuarios (10-20)
- Aumentar gradualmente
- Monitorear logs del servidor
- Hacer pruebas en diferentes horarios
- Documentar resultados

### ❌ No Hacer
- Empezar con 1000 usuarios de golpe
- Ignorar los errores
- Probar en producción sin avisar
- Dejar pruebas corriendo sin supervisión

---

## 📞 Más Información

- Documentación oficial: https://docs.locust.io
- Ejemplos: https://github.com/locustio/locust/tree/master/examples
- Comunidad: https://github.com/locustio/locust/discussions

---

**¡Listo para probar! 🚀**

Ejecuta:
```bash
locust
```

Y abre: http://localhost:8089
