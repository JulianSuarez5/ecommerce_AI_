-- ============================================================
-- CENTROVA - Script de Creación de Base de Datos
-- Motor: SQL Server 2019+
-- Versión: 2.0
-- Descripción: Esquema completo sincronizado con entidades JPA.
--   Las capas de servicio (Spring Boot) manejan la lógica de
--   negocio (stock, hist. estados, creación de pedidos). Este
--   script solo define estructura, constraints e índices.
-- ============================================================

CREATE DATABASE CentrovaDB
GO

USE CentrovaDB;
GO

-- ============================================================
-- TABLA: roles
-- Roles del sistema (ROLE_CLIENT, ROLE_ADMIN)
-- ============================================================
CREATE TABLE roles (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre      VARCHAR(50) NOT NULL,
    CONSTRAINT uq_roles_nombre UNIQUE (nombre)
);
GO

-- ============================================================
-- TABLA: brands
-- Marcas de productos
-- ============================================================
CREATE TABLE brands (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    logo_url    VARCHAR(500),
    activo      BIT NOT NULL DEFAULT 1,
    CONSTRAINT uq_brands_nombre UNIQUE (nombre)
);
GO

-- ============================================================
-- TABLA: suppliers
-- Proveedores para órdenes de compra y mov. inventario
-- ============================================================
CREATE TABLE suppliers (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre      VARCHAR(200) NOT NULL,
    contacto    VARCHAR(100),
    email       VARCHAR(150),
    telefono    VARCHAR(20),
    direccion   VARCHAR(500),
    activo      BIT NOT NULL DEFAULT 1
);
GO

-- ============================================================
-- TABLA: categories
-- Categorías de productos con jerarquía opcional
-- ============================================================
CREATE TABLE categories (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    imagen_url  VARCHAR(500),
    parent_id   BIGINT,
    activo      BIT NOT NULL DEFAULT 1,
    CONSTRAINT uq_categories_nombre UNIQUE (nombre),
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id)
);
GO

-- ============================================================
-- TABLA: users
-- Usuarios del sistema. segundo_nombre y segundo_apellido
-- son opcionales (datos compuestos en Latinoamérica).
-- ============================================================
CREATE TABLE users (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    segundo_nombre  VARCHAR(100),
    apellido        VARCHAR(100) NOT NULL,
    segundo_apellido VARCHAR(100),
    email           VARCHAR(150) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    telefono        VARCHAR(20),
    activo          BIT NOT NULL DEFAULT 1,
    fecha_registro  DATETIME2 NOT NULL DEFAULT GETDATE(),
    ultimo_acceso   DATETIME2,
    CONSTRAINT uq_users_email UNIQUE (email)
);
GO

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_activo ON users(activo);
GO

-- ============================================================
-- TABLA: user_roles
-- Relación M:N entre usuarios y roles
-- ============================================================
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id)
);
GO

-- ============================================================
-- TABLA: products
-- Catálogo de productos con precio, stock y metadata 3D.
-- La imagen principal se almacena aquí (evita JOIN con
-- product_images para listados). La galería extendida
-- está en product_images.
-- ============================================================
CREATE TABLE products (
    id                BIGINT IDENTITY(1,1) PRIMARY KEY,
    nombre            VARCHAR(200) NOT NULL,
    descripcion       VARCHAR(MAX),
    descripcion_corta VARCHAR(500),
    precio            DECIMAL(12,2) NOT NULL,
    precio_oferta     DECIMAL(12,2),
    stock             INT NOT NULL DEFAULT 0,
    stock_minimo      INT NOT NULL DEFAULT 5,
    sku               VARCHAR(100) NOT NULL,
    imagen_principal  VARCHAR(500),
    modelo_3d_url     VARCHAR(500),
    colores           VARCHAR(MAX),
    especificaciones  VARCHAR(MAX),
    tags              VARCHAR(500),
    category_id       BIGINT NOT NULL,
    brand_id          BIGINT,
    activo            BIT NOT NULL DEFAULT 1,
    destacado         BIT NOT NULL DEFAULT 0,
    fecha_creacion    DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT uq_products_sku UNIQUE (sku),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id),
    CONSTRAINT chk_products_precio CHECK (precio > 0),
    CONSTRAINT chk_products_stock CHECK (stock >= 0)
);
GO

CREATE INDEX idx_product_category ON products(category_id) WHERE activo = 1;
CREATE INDEX idx_product_sku ON products(sku);
CREATE INDEX idx_product_activo ON products(activo);
CREATE INDEX idx_product_destacado ON products(destacado) WHERE activo = 1;
GO

-- ============================================================
-- TABLA: product_images
-- Galería de imágenes adicionales por producto
-- ============================================================
CREATE TABLE product_images (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    product_id  BIGINT NOT NULL,
    url         VARCHAR(500) NOT NULL,
    orden       INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE
);
GO

-- ============================================================
-- TABLA: inventory_movements
-- Trazabilidad de entradas, salidas y ajustes de stock.
-- La capa de servicio inserta registros aquí al crear
-- pedidos o recibir compras.
-- ============================================================
CREATE TABLE inventory_movements (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    product_id      BIGINT NOT NULL,
    tipo            VARCHAR(20) NOT NULL,
    cantidad        INT NOT NULL,
    costo_unitario  DECIMAL(12,2),
    supplier_id     BIGINT,
    referencia      VARCHAR(500),
    usuario_registro VARCHAR(100),
    fecha_movimiento DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_inv_movements_product FOREIGN KEY (product_id)
        REFERENCES products(id),
    CONSTRAINT fk_inv_movements_supplier FOREIGN KEY (supplier_id)
        REFERENCES suppliers(id)
);
GO

CREATE INDEX idx_inv_movements_product ON inventory_movements(product_id, fecha_movimiento DESC);
GO

-- ============================================================
-- TABLA: password_reset_tokens
-- Tokens para recuperación de contraseña. Se almacenan como
-- hash SHA-256 (NUNCA en texto plano). El valor raw se envía
-- al usuario por email y se hashea antes de buscar en BD.
-- ============================================================
CREATE TABLE password_reset_tokens (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    token           VARCHAR(255) NOT NULL,
    user_id         BIGINT NOT NULL,
    expiry_date     DATETIME2 NOT NULL,
    usado           BIT NOT NULL DEFAULT 0,
    CONSTRAINT uq_password_reset_token UNIQUE (token),
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id)
        REFERENCES users(id)
);
GO

-- ============================================================
-- TABLA: addresses
-- Direcciones de envío del usuario. Múltiples direcciones
-- por usuario, una marcada como principal.
-- ============================================================
CREATE TABLE addresses (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id       BIGINT NOT NULL,
    alias         VARCHAR(50) NOT NULL DEFAULT 'Casa',
    calle         VARCHAR(200) NOT NULL,
    numero        VARCHAR(20) NOT NULL,
    ciudad        VARCHAR(100) NOT NULL,
    departamento  VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20),
    referencia    VARCHAR(300),
    es_principal  BIT NOT NULL DEFAULT 0,
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

CREATE INDEX idx_addresses_user ON addresses(user_id);
GO

-- ============================================================
-- TABLA: purchase_orders
-- Órdenes de compra a proveedores para reposición de stock
-- ============================================================
CREATE TABLE purchase_orders (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    supplier_id     BIGINT NOT NULL,
    estado          VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    total           DECIMAL(12,2) NOT NULL,
    notas           VARCHAR(500),
    fecha_creacion  DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_recepcion DATETIME2,
    CONSTRAINT fk_purchase_orders_supplier FOREIGN KEY (supplier_id)
        REFERENCES suppliers(id)
);
GO

-- ============================================================
-- TABLA: purchase_order_items
-- Detalle de productos en una orden de compra
-- ============================================================
CREATE TABLE purchase_order_items (
    id                BIGINT IDENTITY(1,1) PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL,
    product_id        BIGINT NOT NULL,
    cantidad          INT NOT NULL,
    costo_unitario    DECIMAL(12,2) NOT NULL,
    subtotal          DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_po_items_order FOREIGN KEY (purchase_order_id)
        REFERENCES purchase_orders(id),
    CONSTRAINT fk_po_items_product FOREIGN KEY (product_id)
        REFERENCES products(id)
);
GO

-- ============================================================
-- TABLA: purchase_order_status_history
-- Historial de cambios de estado de órdenes de compra
-- ============================================================
CREATE TABLE purchase_order_status_history (
    id                BIGINT IDENTITY(1,1) PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL,
    estado            VARCHAR(30) NOT NULL,
    comentario        VARCHAR(500),
    usuario           VARCHAR(100),
    fecha             DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_po_status_history_order FOREIGN KEY (purchase_order_id)
        REFERENCES purchase_orders(id)
);
GO

-- ============================================================
-- TABLA: cart
-- Carrito persistente (no de sesión) para recuperación de
-- carritos abandonados. Un carrito activo por usuario.
-- ============================================================
CREATE TABLE cart (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    fecha_creacion      DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_actualizacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT uq_cart_user UNIQUE (user_id),
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

-- ============================================================
-- TABLA: cart_items
-- Ítems dentro del carrito de compras
-- ============================================================
CREATE TABLE cart_items (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    cart_id         BIGINT NOT NULL,
    product_id      BIGINT NOT NULL,
    cantidad        INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(12,2) NOT NULL,
    CONSTRAINT uq_cart_items UNIQUE (cart_id, product_id),
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id)
        REFERENCES cart(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id)
        REFERENCES products(id),
    CONSTRAINT chk_cart_items_cantidad CHECK (cantidad > 0)
);
GO

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
GO

-- ============================================================
-- TABLA: orders
-- Pedidos realizados. Almacena snapshot de precios para
-- integridad histórica (el precio del producto puede
-- cambiar después).
-- ============================================================
CREATE TABLE orders (
    id                BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id           BIGINT NOT NULL,
    address_id        BIGINT NOT NULL,
    estado            VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    subtotal          DECIMAL(12,2) NOT NULL,
    costo_envio       DECIMAL(12,2) NOT NULL DEFAULT 0,
    total             DECIMAL(12,2) NOT NULL,
    notas             VARCHAR(500),
    fecha_pedido      DATETIME2 NOT NULL DEFAULT GETDATE(),
    fecha_envio       DATETIME2,
    fecha_entrega     DATETIME2,
    numero_seguimiento VARCHAR(100),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses(id)
);
GO

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_estado ON orders(estado);
CREATE INDEX idx_orders_fecha ON orders(fecha_pedido DESC);
GO

-- ============================================================
-- TABLA: order_details
-- Detalle de productos por pedido (snapshot de precio)
-- ============================================================
CREATE TABLE order_details (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id        BIGINT NOT NULL,
    product_id      BIGINT NOT NULL,
    cantidad        INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal        DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_order_details_order FOREIGN KEY (order_id)
        REFERENCES orders(id),
    CONSTRAINT fk_order_details_product FOREIGN KEY (product_id)
        REFERENCES products(id),
    CONSTRAINT chk_order_details_cantidad CHECK (cantidad > 0)
);
GO

-- ============================================================
-- TABLA: payments
-- Registro de pagos. referencia_externa con UNIQUE para
-- garantizar idempotencia (evitar doble cobro PayPal).
-- ============================================================
CREATE TABLE payments (
    id                 BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id           BIGINT NOT NULL,
    metodo             VARCHAR(50) NOT NULL DEFAULT 'TARJETA',
    estado             VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    monto              DECIMAL(12,2) NOT NULL,
    referencia_externa VARCHAR(200) UNIQUE,
    fecha_pago         DATETIME2,
    fecha_creacion     DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT uq_payments_order UNIQUE (order_id),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id)
);
GO

-- ============================================================
-- TABLA: order_status_history
-- Historial de cambios de estado para auditoría
-- ============================================================
CREATE TABLE order_status_history (
    id        BIGINT IDENTITY(1,1) PRIMARY KEY,
    order_id  BIGINT NOT NULL,
    estado    VARCHAR(30) NOT NULL,
    comentario VARCHAR(500),
    fecha     DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_order_status_order FOREIGN KEY (order_id)
        REFERENCES orders(id)
);
GO

CREATE INDEX idx_order_status_order ON order_status_history(order_id);
GO

-- ============================================================
-- STORED PROCEDURE: sp_MetricasDashboard
-- Métricas para el panel de administración
-- ============================================================
CREATE OR ALTER PROCEDURE sp_MetricasDashboard
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        (SELECT COUNT(*)
         FROM orders
         WHERE MONTH(fecha_pedido) = MONTH(GETDATE())
           AND YEAR(fecha_pedido) = YEAR(GETDATE())
        ) AS pedidos_mes,

        (SELECT ISNULL(SUM(total), 0)
         FROM orders
         WHERE estado NOT IN ('CANCELADO')
           AND MONTH(fecha_pedido) = MONTH(GETDATE())
           AND YEAR(fecha_pedido) = YEAR(GETDATE())
        ) AS ventas_mes,

        (SELECT COUNT(*) FROM orders WHERE estado = 'PENDIENTE'
        ) AS pedidos_pendientes,

        (SELECT COUNT(*)
         FROM products
         WHERE stock = 0 AND activo = 1
        ) AS productos_agotados,

        (SELECT COUNT(*)
         FROM products
         WHERE stock > 0 AND stock <= stock_minimo AND activo = 1
        ) AS stock_bajo,

        (SELECT COUNT(*) FROM users WHERE activo = 1
        ) AS clientes_activos;
END
GO

-- ============================================================
-- DATOS INICIALES (desarrollo)
-- NOTA: Los hash bcrypt corresponden a la contraseña
-- "Admin123!" para ambos usuarios (dev convenience).
-- En producción usar flujo de registro.
-- ============================================================

INSERT INTO roles (nombre) VALUES ('ROLE_ADMIN'), ('ROLE_CLIENT');
GO

INSERT INTO categories (nombre, descripcion) VALUES
    ('Electrónica',  'Dispositivos electrónicos y gadgets'),
    ('Ropa',         'Moda para hombre y mujer'),
    ('Hogar',        'Artículos para el hogar y decoración'),
    ('Deportes',     'Artículos deportivos y fitness'),
    ('Libros',       'Libros, revistas y material educativo');
GO

INSERT INTO brands (nombre, descripcion) VALUES
    ('TechPro',   'Electrónica de alta gama'),
    ('SportMax',  'Equipamiento deportivo profesional'),
    ('HomeStyle', 'Muebles y decoración moderna');
GO

INSERT INTO suppliers (nombre, contacto, email, telefono) VALUES
    ('Distribuidora Nacional S.A.', 'Carlos López', 'carlos@dnacional.com', '999888001'),
    ('Importadora Global',          'María García', 'maria@iglobal.com',   '999888002');
GO

-- Usuario administrador
INSERT INTO users (nombre, apellido, email, password_hash, telefono) VALUES
    ('Admin', 'Sistema', 'admin@tienda.com',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgLjr/3mRvVfAO2rnJjE0S', '999000001');

-- Usuario cliente
INSERT INTO users (nombre, segundo_nombre, apellido, segundo_apellido, email, password_hash, telefono) VALUES
    ('Juan', 'Carlos', 'Pérez', 'García', 'juan@cliente.com',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgLjr/3mRvVfAO2rnJjE0S', '999000002');
GO

INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);
INSERT INTO user_roles (user_id, role_id) VALUES (2, 2);
GO

INSERT INTO products (nombre, descripcion_corta, descripcion, precio, precio_oferta, stock, stock_minimo, sku, category_id, brand_id, destacado, imagen_principal) VALUES
('Laptop Pro 15"',
 'Laptop de alto rendimiento para profesionales',
 'Procesador Intel Core i7, 16GB RAM DDR5, SSD NVMe 512GB, pantalla IPS 15.6" Full HD.',
 1299.99, 1099.99, 25, 5, 'LAP-PRO-001', 1, 1, 1,
 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),

('Smartphone Galaxy X',
 'El smartphone del futuro, hoy',
 'Pantalla AMOLED 6.7", cámara 108MP, batería 5000mAh, 5G nativo.',
 799.99, NULL, 50, 10, 'SMA-GAL-002', 1, 1, 1,
 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'),

('Auriculares Noise Cancel',
 'Sonido premium, silencio absoluto',
 'Cancelación activa de ruido, 30h de batería, conexión Bluetooth 5.0 multidevice.',
 249.99, 199.99, 40, 8, 'AUR-NOI-003', 1, 1, 0,
 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),

('Zapatillas Running Pro',
 'Máximo rendimiento en cada paso',
 'Suela de carbono, amortiguación reactiva, upper knit transpirable. Tallas 38-46.',
 149.99, NULL, 60, 10, 'ZAP-RUN-004', 4, 2, 1,
 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),

('Cámara Mirrorless 4K',
 'Fotografía profesional al alcance',
 'Sensor APS-C 24MP, video 4K 60fps, estabilización óptica 5 ejes, Wi-Fi/Bluetooth.',
 899.99, 799.99, 15, 3, 'CAM-MIR-005', 1, 1, 1,
 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400'),

('Monitor UltraWide 34"',
 'Espacio de trabajo sin límites',
 'Resolución 3440x1440, 144Hz, IPS, tiempo de respuesta 1ms, HDR400.',
 599.99, NULL, 20, 4, 'MON-ULT-006', 1, 1, 0,
 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'),

('Set de Yoga Completo',
 'Todo lo que necesitas para tu práctica',
 'Mat antideslizante 6mm, 2 bloques, correa, bolsa de transporte. Material ecológico.',
 89.99, 69.99, 80, 15, 'YOG-SET-007', 4, 2, 0,
 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'),

('Clean Code - R. Martin',
 'El libro de referencia para desarrolladores',
 'Segunda edición actualizada. Principios, patrones y prácticas para código limpio.',
 45.99, NULL, 100, 20, 'LIB-CLN-008', 5, NULL, 0,
 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),

('Sofá Modular 3 Cuerpos',
 'Confort y estilo para tu sala',
 'Tapizado en tela antimanchas, patas de madera sólida, incluye 4 almohadones decorativos.',
 1199.99, 999.99, 8, 2, 'SOF-MOD-009', 3, 3, 1,
 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'),

('Camiseta Premium Modal',
 'Suavidad y durabilidad en cada lavado',
 '95% modal, 5% elastano. Corte slim fit, costuras planas. Disponible en 12 colores.',
 35.99, 24.99, 150, 30, 'CAM-MOD-010', 2, NULL, 0,
 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400');
GO

INSERT INTO addresses (user_id, alias, calle, numero, ciudad, departamento, codigo_postal, es_principal)
VALUES (2, 'Casa', 'Av. Los Álamos', '234', 'Lima', 'Lima', '15001', 1);
GO

INSERT INTO cart (user_id) VALUES (2);
GO

PRINT 'Base de datos CentrovaDB creada exitosamente.';
GO
