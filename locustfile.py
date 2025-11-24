"""
Pruebas de carga para Mojito Bar API
Ejecutar con: locust --host=http://localhost:3000
"""

from locust import HttpUser, task, between
import random


class MojitoBarUser(HttpUser):
    """
    Simula un usuario del sistema Mojito Bar
    """
    weight = 80  # 80 clientes normales
    wait_time = between(1, 3)  # Espera entre 1-3 segundos entre peticiones
    
    def on_start(self):
        """
        Se ejecuta cuando un usuario virtual inicia
        Puede usarse para login o setup inicial
        """
        # Verificar que el servidor esté activo
        self.client.get("/health")
    
    @task(5)  # Peso 5 - Se ejecuta más frecuentemente
    def listar_productos(self):
        """GET /producto - Listar todos los productos"""
        self.client.get("/producto")
    
    @task(3)
    def obtener_producto_especifico(self):
        """GET /producto/:id - Obtener un producto específico"""
        producto_id = random.randint(1, 7)  # IDs de productos existentes
        self.client.get(f"/producto/{producto_id}")
    
    @task(2)
    def obtener_inventario(self):
        """GET /inventario/:id - Obtener inventario específico"""
        inventario_id = random.randint(1, 10)
        self.client.get(f"/inventario/{inventario_id}")
    
    @task(4)
    def listar_pedidos(self):
        """GET /pedido - Listar todos los pedidos"""
        self.client.get("/pedido")
    
    @task(3)
    def listar_pedidos_pendientes(self):
        """GET /pedido?estado=pendiente - Filtrar pedidos pendientes"""
        self.client.get("/pedido?estado=pendiente")
    
    @task(2)
    def obtener_pedido_especifico(self):
        """GET /pedido/:id - Obtener un pedido específico"""
        pedido_id = random.randint(1, 5)
        self.client.get(f"/pedido/{pedido_id}", name="/pedido/[id]")
    
    @task(1)
    def crear_pedido(self):
        """POST /pedido - Crear un nuevo pedido"""
        productos = [
            {"producto_id": 1, "cantidad": random.randint(1, 3)},  # Mojito
            {"producto_id": 2, "cantidad": random.randint(1, 2)},  # Piscola
            {"producto_id": 4, "cantidad": random.randint(1, 2)},  # Destornillador
        ]
        
        # Seleccionar 1-2 productos aleatorios
        productos_seleccionados = random.sample(productos, random.randint(1, 2))
        
        payload = {
            "usuario_id": 2,
            "cliente_id": random.randint(1, 3),
            "productos": productos_seleccionados
        }
        
        with self.client.post("/pedido", json=payload, catch_response=True) as response:
            if response.status_code == 201:
                response.success()
            else:
                response.failure(f"Error creando pedido: {response.status_code}")
    
    @task(1)
    def actualizar_inventario(self):
        """POST /inventario/actualizar - Actualizar cantidad de inventario"""
        inventario_id = random.randint(1, 10)
        cantidad = random.randint(100, 10000)
        
        payload = {
            "inventarioId": inventario_id,
            "cantidad": cantidad
        }
        
        with self.client.post("/inventario/actualizar", json=payload, catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error actualizando inventario: {response.status_code}")
    
    @task(1)
    def actualizar_estado_pedido(self):
        """PATCH /pedido/:id/estado - Actualizar estado de pedido"""
        pedido_id = random.randint(1, 10)
        estados = ["preparando", "listo", "entregado"]
        
        payload = {
            "estado": random.choice(estados)
        }
        
        with self.client.patch(
            f"/pedido/{pedido_id}/estado", 
            json=payload, 
            catch_response=True,
            name="/pedido/[id]/estado"
        ) as response:
            if response.status_code in [200, 404]:  # 404 es aceptable si el pedido no existe
                response.success()
            else:
                response.failure(f"Error actualizando estado: {response.status_code}")


class AdminUser(HttpUser):
    """
    Simula un usuario administrador con acceso a operaciones más pesadas
    """
    weight = 1  # Pocos administradores
    wait_time = between(2, 5)
    
    @task
    def health_check(self):
        """GET /health - Health check del servidor"""
        self.client.get("/health")
    
    @task(2)
    def listar_todos_productos(self):
        """Listar productos repetidamente"""
        self.client.get("/producto")
    
    @task(2)
    def listar_todos_pedidos(self):
        """Listar todos los pedidos"""
        self.client.get("/pedido")
    
    @task
    def filtrar_pedidos_por_estado(self):
        """Filtrar pedidos por diferentes estados"""
        estados = ["pendiente", "preparando", "listo", "entregado", "cancelado"]
        estado = random.choice(estados)
        self.client.get(f"/pedido?estado={estado}")


class BartenderUser(HttpUser):
    """
    Simula un bartender preparando pedidos
    """
    weight = 8  # 8 bartenders por cada 80 clientes (10% del personal)
    wait_time = between(3, 8)  # Los bartenders trabajan más lento
    
    @task(5)
    def ver_pedidos_pendientes(self):
        """Ver pedidos pendientes para preparar"""
        self.client.get("/pedido?estado=pendiente")
    
    @task(3)
    def ver_pedidos_en_preparacion(self):
        """Ver pedidos que están preparando"""
        self.client.get("/pedido?estado=preparando")
    
    @task(2)
    def actualizar_pedido_a_preparando(self):
        """Empezar a preparar un pedido"""
        pedido_id = random.randint(1, 10)
        payload = {"estado": "preparando"}
        self.client.patch(f"/pedido/{pedido_id}/estado", json=payload, name="/pedido/[id]/estado")
    
    @task(2)
    def marcar_pedido_listo(self):
        """Marcar pedido como listo"""
        pedido_id = random.randint(1, 10)
        payload = {"estado": "listo"}
        self.client.patch(f"/pedido/{pedido_id}/estado", json=payload, name="/pedido/[id]/estado")
    
    @task(1)
    def verificar_inventario(self):
        """Verificar ingredientes disponibles"""
        inventario_id = random.randint(1, 10)
        self.client.get(f"/inventario/{inventario_id}")
