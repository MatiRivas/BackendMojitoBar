"""
Locust - Pruebas de carga para Mojito Bar API
Ejecutar con: locust
Luego abrir http://localhost:8089 en el navegador
"""

from locust import HttpUser, task, between
import random
import json


class MojitoBarUser(HttpUser):
    """
    Simula un usuario/cliente normal del sistema Mojito Bar API
    """
    # Tiempo de espera entre requests (1-3 segundos)
    wait_time = between(1, 3)
    
    # Host base - será configurable desde la UI de Locust
    host = "http://localhost:3000"
    
    # 500 usuarios normales por cada admin y bartender
    weight = 500
    
    def on_start(self):
        """
        Se ejecuta una vez cuando un usuario inicia
        Útil para login o setup inicial
        """
        # Verificar que el servidor está funcionando
        response = self.client.get("/health")
        if response.status_code != 200:
            print("⚠️ Advertencia: El servidor no responde correctamente")
    
    @task(5)
    def listar_productos(self):
        """
        Tarea más común (peso 5): Listar todos los productos
        """
        with self.client.get("/producto", catch_response=True) as response:
            if response.status_code == 200:
                try:
                    productos = response.json()
                    if isinstance(productos, list):
                        response.success()
                    else:
                        response.failure("Respuesta no es una lista")
                except json.JSONDecodeError:
                    response.failure("Respuesta no es JSON válido")
            else:
                response.failure(f"Error {response.status_code}")
    
    @task(3)
    def obtener_producto_especifico(self):
        """
        Tarea común (peso 3): Obtener un producto por ID
        """
        # IDs comunes de productos (1-7 basado en schema.sql)
        producto_id = random.randint(1, 7)
        
        with self.client.get(f"/producto/{producto_id}", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 404:
                # Aceptar 404 como válido (producto no existe)
                response.success()
            else:
                response.failure(f"Error inesperado: {response.status_code}")
    
    @task(2)
    def consultar_inventario(self):
        """
        Tarea moderada (peso 2): Consultar inventario
        """
        # IDs de inventario (1-9 basado en schema.sql)
        inventario_id = random.randint(1, 9)
        
        with self.client.get(f"/inventario/{inventario_id}", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 404:
                response.success()
            else:
                response.failure(f"Error {response.status_code}")
    
    @task(4)
    def listar_pedidos(self):
        """
        Tarea común (peso 4): Listar pedidos
        """
        estados = ["", "?estado=pendiente", "?estado=preparando", "?estado=listo"]
        filtro = random.choice(estados)
        
        with self.client.get(f"/pedido{filtro}", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error {response.status_code}")
    
    @task(2)
    def obtener_pedido_especifico(self):
        """
        Tarea moderada (peso 2): Obtener un pedido específico
        """
        pedido_id = random.randint(1, 10)
        
        with self.client.get(f"/pedido/{pedido_id}", catch_response=True) as response:
            if response.status_code in [200, 404]:
                response.success()
            else:
                response.failure(f"Error {response.status_code}")
    
    @task(1)
    def crear_pedido(self):
        """
        Tarea menos frecuente (peso 1): Crear un nuevo pedido
        """
        # Datos para crear pedido
        pedido_data = {
            "usuario_id": random.randint(1, 3),
            "cliente_id": random.randint(1, 5),
            "productos": [
                {
                    "producto_id": random.randint(1, 7),
                    "cantidad": random.randint(1, 3)
                },
                {
                    "producto_id": random.randint(1, 7),
                    "cantidad": random.randint(1, 2)
                }
            ]
        }
        
        with self.client.post(
            "/pedido",
            json=pedido_data,
            catch_response=True
        ) as response:
            if response.status_code == 201:
                response.success()
            elif response.status_code == 400:
                # Aceptar errores de validación
                response.success()
            else:
                response.failure(f"Error {response.status_code}")
    
    @task(1)
    def crear_producto(self):
        """
        Tarea poco frecuente (peso 1): Crear un nuevo producto
        """
        nombres = ["Test Mojito", "Test Piscola", "Test Cuba Libre", "Test Margarita"]
        categorias = ["Cocteles", "Tragos Largos", "Shots", "Bebidas"]
        
        producto_data = {
            "nombre": f"{random.choice(nombres)} {random.randint(1, 1000)}",
            "precio": random.randint(3000, 8000),
            "categoria": random.choice(categorias),
            "disponibilidad": random.choice([True, False]),
            "tiempo_preparacion_estimado": random.randint(1, 10)
        }
        
        with self.client.post(
            "/producto",
            json=producto_data,
            catch_response=True
        ) as response:
            if response.status_code == 201:
                response.success()
            elif response.status_code == 400:
                response.success()
            else:
                response.failure(f"Error {response.status_code}")
    
    @task(1)
    def actualizar_producto(self):
        """
        Tarea poco frecuente (peso 1): Actualizar un producto existente
        """
        producto_id = random.randint(1, 7)
        
        update_data = {
            "precio": random.randint(4000, 9000),
            "disponibilidad": random.choice([True, False])
        }
        
        with self.client.put(
            f"/producto/{producto_id}",
            json=update_data,
            catch_response=True
        ) as response:
            if response.status_code in [200, 404]:
                response.success()
            else:
                response.failure(f"Error {response.status_code}")
    
    @task(1)
    def actualizar_estado_pedido(self):
        """
        Tarea poco frecuente (peso 1): Actualizar estado de pedido
        """
        pedido_id = random.randint(1, 10)
        estados = ["pendiente", "preparando", "listo", "entregado"]
        
        estado_data = {
            "estado": random.choice(estados)
        }
        
        with self.client.patch(
            f"/pedido/{pedido_id}/estado",
            json=estado_data,
            catch_response=True
        ) as response:
            if response.status_code in [200, 404, 400]:
                response.success()
            else:
                response.failure(f"Error {response.status_code}")
    
    @task(1)
    def actualizar_inventario(self):
        """
        Tarea poco frecuente (peso 1): Actualizar inventario
        """
        inventario_data = {
            "inventarioId": random.randint(1, 9),
            "cantidad": random.randint(100, 5000)
        }
        
        with self.client.post(
            "/inventario/actualizar",
            json=inventario_data,
            catch_response=True
        ) as response:
            if response.status_code in [200, 404, 400]:
                response.success()
            else:
                response.failure(f"Error {response.status_code}")
    
    @task(10)
    def health_check(self):
        """
        Tarea muy frecuente (peso 10): Health check
        """
        with self.client.get("/health", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure("Health check falló")


class BartenderUser(HttpUser):
    """
    Usuario bartender que gestiona pedidos e inventario
    """
    wait_time = between(1, 3)
    host = "http://localhost:3000"
    
    # 1 bartender por cada 500 usuarios normales
    weight = 1
    
    @task(5)
    def ver_pedidos_pendientes(self):
        """Ver pedidos pendientes para preparar"""
        self.client.get("/pedido?estado=pendiente")
    
    @task(5)
    def ver_pedidos_preparando(self):
        """Ver pedidos en preparación"""
        self.client.get("/pedido?estado=preparando")
    
    @task(4)
    def actualizar_estado_a_preparando(self):
        """Tomar un pedido pendiente y marcarlo como preparando"""
        pedido_id = random.randint(1, 20)
        self.client.patch(
            f"/pedido/{pedido_id}/estado",
            json={"estado": "preparando"}
        )
    
    @task(4)
    def actualizar_estado_a_listo(self):
        """Marcar pedido como listo"""
        pedido_id = random.randint(1, 20)
        self.client.patch(
            f"/pedido/{pedido_id}/estado",
            json={"estado": "listo"}
        )
    
    @task(3)
    def consultar_inventario_multiple(self):
        """Revisar inventario de varios ingredientes"""
        for inv_id in range(1, 6):
            self.client.get(f"/inventario/{inv_id}")
    
    @task(2)
    def actualizar_inventario_usado(self):
        """Actualizar inventario después de preparar bebidas"""
        inventario_data = {
            "inventarioId": random.randint(1, 9),
            "cantidad": random.randint(500, 4000)
        }
        self.client.post("/inventario/actualizar", json=inventario_data)
    
    @task(1)
    def ver_todos_los_pedidos(self):
        """Ver todos los pedidos del día"""
        self.client.get("/pedido")


class AdminUser(HttpUser):
    """
    Usuario administrador que hace operaciones más pesadas
    """
    wait_time = between(2, 5)
    host = "http://localhost:3000"
    
    # 1 admin por cada 500 usuarios normales
    weight = 1
    
    @task(2)
    def crear_productos_masivo(self):
        """Crear varios productos"""
        for i in range(3):
            producto_data = {
                "nombre": f"Producto Admin {random.randint(1, 1000)}",
                "precio": random.randint(5000, 10000),
                "categoria": "Admin",
                "disponibilidad": True,
                "tiempo_preparacion_estimado": random.randint(5, 15)
            }
            self.client.post("/producto", json=producto_data)
    
    @task(1)
    def ver_todos_pedidos(self):
        """Ver todos los pedidos sin filtro"""
        self.client.get("/pedido")
    
    @task(1)
    def actualizar_inventarios_masivo(self):
        """Actualizar varios inventarios"""
        for inventario_id in range(1, 5):
            inventario_data = {
                "inventarioId": inventario_id,
                "cantidad": random.randint(1000, 8000)
            }
            self.client.post("/inventario/actualizar", json=inventario_data)
