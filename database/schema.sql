-- ========================================
-- SCHEMA: MOJITO BAR - Sistema de Pedidos
-- ========================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- TABLA: CLIENTE
-- Clientes que compran en el bar
-- ========================================
CREATE TABLE IF NOT EXISTS cliente (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefono VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cliente_email ON cliente(email);

-- ========================================
-- TABLA: USUARIO
-- Personal del bar (meseros, bartenders, admin)
-- ========================================
CREATE TABLE IF NOT EXISTS usuario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    clave VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'mesero', 'bartender')),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuario_rol ON usuario(rol);
CREATE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email);

-- ========================================
-- TABLA: PRODUCTO (Tragos/Bebidas)
-- Productos que se venden (Mojito, Piscola, etc.)
-- ========================================
CREATE TABLE IF NOT EXISTS producto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL CHECK (precio > 0),
    categoria VARCHAR(100) NOT NULL,
    disponibilidad BOOLEAN DEFAULT true,
    tiempo_preparacion_estimado INTEGER DEFAULT 0,
    descripcion TEXT,
    imagen_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_producto_categoria ON producto(categoria);
CREATE INDEX IF NOT EXISTS idx_producto_disponibilidad ON producto(disponibilidad);

-- ========================================
-- TABLA: INVENTARIO (Ingredientes)
-- Inventario de ingredientes (Ron, Coca-Cola, Hielo, Limón, etc.)
-- ========================================
CREATE TABLE IF NOT EXISTS inventario (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cantidad_disponible DECIMAL(10, 3) NOT NULL CHECK (cantidad_disponible >= 0),
    unidad VARCHAR(50) NOT NULL,
    tipo VARCHAR(100),
    stock_minimo DECIMAL(10, 3) DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventario_nombre ON inventario(nombre);
CREATE INDEX IF NOT EXISTS idx_inventario_tipo ON inventario(tipo);

-- ========================================
-- TABLA: DETALLE_PRODUCTO_INVENTARIO
-- Ingredientes necesarios para cada producto (receta)
-- ========================================
CREATE TABLE IF NOT EXISTS detalle_producto_inventario (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
    inventario_id INTEGER NOT NULL REFERENCES inventario(id) ON DELETE RESTRICT,
    cantidad_necesaria DECIMAL(10, 3) NOT NULL CHECK (cantidad_necesaria > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(producto_id, inventario_id)
);

CREATE INDEX IF NOT EXISTS idx_detalle_prod_inv_producto ON detalle_producto_inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_detalle_prod_inv_inventario ON detalle_producto_inventario(inventario_id);

-- ========================================
-- TABLA: PEDIDO
-- Pedidos de clientes
-- ========================================
CREATE TABLE IF NOT EXISTS pedido (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES cliente(id) ON DELETE SET NULL,
    usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'preparando', 'listo', 'entregado', 'cancelado')),
    total DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pedido_cliente ON pedido(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedido_usuario ON pedido(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedido_estado ON pedido(estado);
CREATE INDEX IF NOT EXISTS idx_pedido_fecha ON pedido(fecha_hora);

-- ========================================
-- TABLA: DETALLE_PEDIDO
-- Productos específicos de cada pedido
-- ========================================
CREATE TABLE IF NOT EXISTS detalle_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES producto(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario > 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_detalle_pedido_pedido ON detalle_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_producto ON detalle_pedido(producto_id);

-- ========================================
-- TRIGGERS
-- ========================================

DROP TRIGGER IF EXISTS update_cliente_updated_at ON cliente;
CREATE TRIGGER update_cliente_updated_at
    BEFORE UPDATE ON cliente
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usuario_updated_at ON usuario;
CREATE TRIGGER update_usuario_updated_at
    BEFORE UPDATE ON usuario
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_producto_updated_at ON producto;
CREATE TRIGGER update_producto_updated_at
    BEFORE UPDATE ON producto
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventario_updated_at ON inventario;
CREATE TRIGGER update_inventario_updated_at
    BEFORE UPDATE ON inventario
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pedido_updated_at ON pedido;
CREATE TRIGGER update_pedido_updated_at
    BEFORE UPDATE ON pedido
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- DATOS DE EJEMPLO - USUARIOS
-- ========================================
INSERT INTO usuario (nombre, email, clave, rol) VALUES
    ('Admin Bar', 'admin@mojitobar.com', '$2b$10$abcdefghijk', 'admin'),
    ('Juan Mesero', 'juan@mojitobar.com', '$2b$10$abcdefghijk', 'mesero'),
    ('María Bartender', 'maria@mojitobar.com', '$2b$10$abcdefghijk', 'bartender')
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- DATOS DE EJEMPLO - CLIENTES
-- ========================================
INSERT INTO cliente (nombre, email, telefono) VALUES
    ('Carlos Pérez', 'carlos@email.com', '+56912345678'),
    ('Ana López', 'ana@email.com', '+56987654321'),
    ('Diego Silva', 'diego@email.com', '+56955555555')
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- DATOS DE EJEMPLO - INVENTARIO (Ingredientes)
-- ========================================
INSERT INTO inventario (nombre, cantidad_disponible, unidad, tipo, stock_minimo) VALUES
    ('Ron Blanco', 5000, 'ml', 'Licor', 1000),
    ('Coca-Cola', 10000, 'ml', 'Refresco', 2000),
    ('Pisco', 3000, 'ml', 'Licor', 500),
    ('Limón', 50, 'unidades', 'Fruta', 10),
    ('Menta', 100, 'hojas', 'Hierba', 20),
    ('Hielo', 20000, 'gramos', 'Hielo', 5000),
    ('Agua con Gas', 5000, 'ml', 'Refresco', 1000),
    ('Azúcar', 2000, 'gramos', 'Endulzante', 500),
    ('Vodka', 2000, 'ml', 'Licor', 500),
    ('Jugo de Naranja', 3000, 'ml', 'Jugo', 500)
ON CONFLICT DO NOTHING;

-- ========================================
-- DATOS DE EJEMPLO - PRODUCTOS (Tragos)
-- ========================================
INSERT INTO producto (nombre, precio, categoria, disponibilidad, tiempo_preparacion_estimado, descripcion) VALUES
    ('Mojito', 6500, 'Cocteles', true, 5, 'Ron blanco, menta, limón, azúcar y agua con gas'),
    ('Piscola', 4500, 'Tragos Largos', true, 2, 'Pisco con Coca-Cola'),
    ('Ron Cola', 4500, 'Tragos Largos', true, 2, 'Ron con Coca-Cola'),
    ('Destornillador', 5500, 'Cocteles', true, 3, 'Vodka con jugo de naranja'),
    ('Mojito de Frutilla', 7000, 'Cocteles', true, 6, 'Mojito con frutillas frescas'),
    ('Caipirinha', 6000, 'Cocteles', true, 5, 'Cachaça, limón y azúcar'),
    ('Pisco Sour', 7500, 'Cocteles', true, 7, 'Pisco, limón, azúcar y clara de huevo')
ON CONFLICT DO NOTHING;

-- ========================================
-- DATOS DE EJEMPLO - RECETAS (Detalle Producto-Inventario)
-- ========================================

-- Mojito: Ron (50ml), Menta (10 hojas), Limón (1 unidad), Azúcar (20g), Agua con gas (100ml), Hielo (150g)
INSERT INTO detalle_producto_inventario (producto_id, inventario_id, cantidad_necesaria)
SELECT p.id, i.id, q.cantidad
FROM producto p
CROSS JOIN (VALUES 
    ('Ron Blanco', 50),
    ('Menta', 10),
    ('Limón', 1),
    ('Azúcar', 20),
    ('Agua con Gas', 100),
    ('Hielo', 150)
) AS q(ingrediente, cantidad)
JOIN inventario i ON i.nombre = q.ingrediente
WHERE p.nombre = 'Mojito'
ON CONFLICT DO NOTHING;

-- Piscola: Pisco (50ml), Coca-Cola (200ml), Hielo (150g)
INSERT INTO detalle_producto_inventario (producto_id, inventario_id, cantidad_necesaria)
SELECT p.id, i.id, q.cantidad
FROM producto p
CROSS JOIN (VALUES 
    ('Pisco', 50),
    ('Coca-Cola', 200),
    ('Hielo', 150)
) AS q(ingrediente, cantidad)
JOIN inventario i ON i.nombre = q.ingrediente
WHERE p.nombre = 'Piscola'
ON CONFLICT DO NOTHING;

-- Ron Cola: Ron Blanco (50ml), Coca-Cola (200ml), Hielo (150g)
INSERT INTO detalle_producto_inventario (producto_id, inventario_id, cantidad_necesaria)
SELECT p.id, i.id, q.cantidad
FROM producto p
CROSS JOIN (VALUES 
    ('Ron Blanco', 50),
    ('Coca-Cola', 200),
    ('Hielo', 150)
) AS q(ingrediente, cantidad)
JOIN inventario i ON i.nombre = q.ingrediente
WHERE p.nombre = 'Ron Cola'
ON CONFLICT DO NOTHING;

-- Destornillador: Vodka (50ml), Jugo de Naranja (150ml), Hielo (150g)
INSERT INTO detalle_producto_inventario (producto_id, inventario_id, cantidad_necesaria)
SELECT p.id, i.id, q.cantidad
FROM producto p
CROSS JOIN (VALUES 
    ('Vodka', 50),
    ('Jugo de Naranja', 150),
    ('Hielo', 150)
) AS q(ingrediente, cantidad)
JOIN inventario i ON i.nombre = q.ingrediente
WHERE p.nombre = 'Destornillador'
ON CONFLICT DO NOTHING;

-- ========================================
-- DATOS DE EJEMPLO - PEDIDOS
-- ========================================

-- Pedido 1: Cliente Carlos, Mesero Juan
INSERT INTO pedido (cliente_id, usuario_id, estado, total)
SELECT 
    (SELECT id FROM cliente WHERE nombre = 'Carlos Pérez'),
    (SELECT id FROM usuario WHERE nombre = 'Juan Mesero'),
    'entregado',
    11000
ON CONFLICT DO NOTHING;

-- Detalles del Pedido 1
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
SELECT 
    (SELECT id FROM pedido ORDER BY id DESC LIMIT 1),
    p.id,
    d.cantidad,
    p.precio,
    p.precio * d.cantidad
FROM producto p
CROSS JOIN (VALUES 
    ('Mojito', 1),
    ('Piscola', 1)
) AS d(producto_nombre, cantidad)
WHERE p.nombre = d.producto_nombre
ON CONFLICT DO NOTHING;

-- Pedido 2: Cliente Ana, Mesero Juan
INSERT INTO pedido (cliente_id, usuario_id, estado, total)
SELECT 
    (SELECT id FROM cliente WHERE nombre = 'Ana López'),
    (SELECT id FROM usuario WHERE nombre = 'Juan Mesero'),
    'preparando',
    13000
ON CONFLICT DO NOTHING;

-- Detalles del Pedido 2
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
SELECT 
    (SELECT id FROM pedido ORDER BY id DESC LIMIT 1),
    p.id,
    d.cantidad,
    p.precio,
    p.precio * d.cantidad
FROM producto p
CROSS JOIN (VALUES 
    ('Ron Cola', 2),
    ('Piscola', 1)
) AS d(producto_nombre, cantidad)
WHERE p.nombre = d.producto_nombre
ON CONFLICT DO NOTHING;

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista: Productos con sus ingredientes
CREATE OR REPLACE VIEW vista_recetas AS
SELECT 
    p.id as producto_id,
    p.nombre as producto,
    p.precio,
    i.nombre as ingrediente,
    dpi.cantidad_necesaria,
    i.unidad,
    i.cantidad_disponible as disponible_en_inventario
FROM producto p
LEFT JOIN detalle_producto_inventario dpi ON p.id = dpi.producto_id
LEFT JOIN inventario i ON dpi.inventario_id = i.id
ORDER BY p.nombre, i.nombre;

-- Vista: Inventario bajo stock
CREATE OR REPLACE VIEW vista_inventario_bajo_stock AS
SELECT 
    id,
    nombre,
    cantidad_disponible,
    unidad,
    stock_minimo,
    (stock_minimo - cantidad_disponible) as cantidad_faltante
FROM inventario
WHERE cantidad_disponible < stock_minimo
ORDER BY cantidad_disponible ASC;

-- Vista: Resumen de pedidos
CREATE OR REPLACE VIEW vista_resumen_pedidos AS
SELECT 
    p.id,
    p.fecha_hora,
    c.nombre as cliente,
    u.nombre as atendido_por,
    p.estado,
    p.total,
    COUNT(dp.id) as cantidad_productos
FROM pedido p
LEFT JOIN cliente c ON p.cliente_id = c.id
LEFT JOIN usuario u ON p.usuario_id = u.id
LEFT JOIN detalle_pedido dp ON p.id = dp.pedido_id
GROUP BY p.id, c.nombre, u.nombre
ORDER BY p.fecha_hora DESC;

-- ========================================
-- VERIFICACIÓN
-- ========================================
SELECT 'Base de datos del Mojito Bar creada exitosamente' as status;
SELECT COUNT(*) as total_productos FROM producto;
SELECT COUNT(*) as total_inventario FROM inventario;
SELECT COUNT(*) as total_clientes FROM cliente;
SELECT COUNT(*) as total_usuarios FROM usuario;
SELECT COUNT(*) as total_pedidos FROM pedido;
