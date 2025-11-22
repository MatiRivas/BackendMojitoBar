-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS producto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL CHECK (precio > 0),
    categoria VARCHAR(100),
    disponibilidad BOOLEAN DEFAULT true,
    tiempo_preparacion_estimado INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de inventario
CREATE TABLE IF NOT EXISTS inventario (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES producto(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad >= 0),
    ubicacion VARCHAR(50),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_inventario_producto_id ON inventario(producto_id);
CREATE INDEX IF NOT EXISTS idx_producto_categoria ON producto(categoria);
CREATE INDEX IF NOT EXISTS idx_producto_disponibilidad ON producto(disponibilidad);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en producto
DROP TRIGGER IF EXISTS update_producto_updated_at ON producto;
CREATE TRIGGER update_producto_updated_at
    BEFORE UPDATE ON producto
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Datos de ejemplo para testing
INSERT INTO producto (nombre, precio, categoria, disponibilidad, tiempo_preparacion_estimado) 
VALUES 
    ('Café Americano', 2.50, 'Bebidas', true, 5),
    ('Cappuccino', 3.50, 'Bebidas', true, 7),
    ('Croissant', 2.00, 'Panadería', true, 3),
    ('Sandwich', 5.50, 'Comida', true, 10),
    ('Ensalada', 6.00, 'Comida', true, 8)
ON CONFLICT DO NOTHING;

-- Insertar inventario para los productos
INSERT INTO inventario (producto_id, cantidad, ubicacion)
SELECT id, 100, 'Almacén Principal'
FROM producto
WHERE NOT EXISTS (SELECT 1 FROM inventario WHERE inventario.producto_id = producto.id);

-- Verificar instalación
SELECT 'Tablas creadas exitosamente' as status;
SELECT COUNT(*) as total_productos FROM producto;
SELECT COUNT(*) as total_inventario FROM inventario;
