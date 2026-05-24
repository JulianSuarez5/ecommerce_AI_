-- =====================================================
-- CENTROVA - Script de datos reales para la base de datos
-- Ejecutar en SQL Server (CentrovaDB)
-- =====================================================

-- 1. Categorias
INSERT INTO categories (nombre, descripcion, activo, fecha_creacion, fecha_actualizacion)
VALUES 
    ('Electrónica', 'Dispositivos electrónicos y accesorios tecnológicos', 1, GETDATE(), GETDATE()),
    ('Hogar', 'Productos para el hogar y decoración', 1, GETDATE(), GETDATE()),
    ('Deportes', 'Equipamiento deportivo y fitness', 1, GETDATE(), GETDATE()),
    ('Moda', 'Ropa, calzado y accesorios de moda', 1, GETDATE(), GETDATE()),
    ('Juguetes', 'Juguetes y entretenimiento para todas las edades', 1, GETDATE(), GETDATE()),
    ('Libros', 'Libros físicos y digitales de diversas categorías', 1, GETDATE(), GETDATE()),
    ('Belleza', 'Productos de belleza y cuidado personal', 1, GETDATE(), GETDATE()),
    ('Alimentos', 'Alimentos gourmet y productos especiales', 1, GETDATE(), GETDATE())
WHERE NOT EXISTS (SELECT 1 FROM categories);

-- 2. Marcas
INSERT INTO brands (nombre, descripcion, activo, fecha_creacion, fecha_actualizacion)
VALUES 
    ('Samsung', 'Tecnología Samsung', 1, GETDATE(), GETDATE()),
    ('Apple', 'Productos Apple', 1, GETDATE(), GETDATE()),
    ('Nike', 'Deportes Nike', 1, GETDATE(), GETDATE()),
    ('Adidas', 'Deportes Adidas', 1, GETDATE(), GETDATE()),
    ('Sony', 'Electrónica Sony', 1, GETDATE(), GETDATE()),
    ('LG', 'Electrónica LG', 1, GETDATE(), GETDATE()),
    ('Zara', 'Moda Zara', 1, GETDATE(), GETDATE()),
    ('H&M', 'Moda H&M', 1, GETDATE(), GETDATE()),
    ('LEGO', 'Juguetes LEGO', 1, GETDATE(), GETDATE()),
    ('Nintendo', 'Videojuegos Nintendo', 1, GETDATE(), GETDATE())
WHERE NOT EXISTS (SELECT 1 FROM brands);

-- 3. Productos con stock real
-- Electrónica
INSERT INTO products (nombre, descripcion, descripcion_corta, precio, precio_oferta, stock, stock_minimo, sku, imagen_principal, category_id, brand_id, colores, especificaciones, tags, activo, destacado, fecha_creacion, fecha_actualizacion)
VALUES 
    ('Samsung Galaxy S24 Ultra', 'Smartphone premium con cámara de 200MP, S Pen integrado y pantalla Dynamic AMOLED 2X de 6.8 pulgadas', 'Smartphone premium 200MP', 4599000, 4199000, 25, 5, 'SAM-S24U-256', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80', 1, 1, '["Titanium Gray","Titanium Black","Titanium Violet"]', '{"procesador":"Snapdragon 8 Gen 3","ram":"12GB","almacenamiento":"256GB","pantalla":"6.8 AMOLED","bateria":"5000mAh"}', 'smartphone,android,samsung,gama alta', 1, 1, GETDATE(), GETDATE()),

    ('iPhone 15 Pro Max', 'El iPhone más potente con chip A17 Pro, cámara de 48MP y titanio de grado aeroespacial', 'iPhone premium titanio', 5299000, NULL, 18, 5, 'APL-IP15PM-256', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80', 1, 2, '["Titanium Natural","Titanium Blue","Titanium White","Titanium Black"]', '{"procesador":"A17 Pro","ram":"8GB","almacenamiento":"256GB","pantalla":"6.7 OLED","bateria":"4422mAh"}', 'smartphone,iphone,apple,gama alta', 1, 1, GETDATE(), GETDATE()),

    ('Sony WH-1000XM5', 'Auriculares inalámbricos con cancelación de ruido líder en la industria y 30 horas de batería', 'Auriculares ANC premium', 1299000, 1099000, 42, 10, 'SNY-WH1000XM5', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80', 1, 5, '["Black","Silver"]', '{"tipo":"Over-ear","anc":"Si","bateria":"30h","bluetooth":"5.2","peso":"250g"}', 'auriculares,sony,anc,inalambrico', 1, 1, GETDATE(), GETDATE()),

    ('LG OLED55C3 55"', 'Smart TV OLED 4K con procesador α9, Dolby Vision y Atmos, ideal para cine en casa', 'Smart TV OLED 55" 4K', 3899000, 3499000, 12, 3, 'LG-OLED55C3', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80', 1, 6, '["Black"]', '{"resolucion":"4K OLED","procesador":"α9 Gen6","hdr":"Dolby Vision, HDR10","sonido":"Dolby Atmos","smart":"webOS"}', 'tv,oled,lg,4k,smart tv', 1, 1, GETDATE(), GETDATE()),

    ('Nintendo Switch OLED', 'Consola híbrida con pantalla OLED de 7 pulgadas, 64GB de almacenamiento y soporte ajustable', 'Consola híbrida OLED', 1599000, NULL, 30, 8, 'NIN-SW-OLED', 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&q=80', 1, 10, '["White","Neon Red/Blue"]', '{"pantalla":"7 OLED","almacenamiento":"64GB","bateria":"4.5-9h","peso":"420g"}', 'consola,nintendo,switch,gaming', 1, 1, GETDATE(), GETDATE()),

    -- Hogar
    ('Aspiradora Robot iRobot Roomba j7+', 'Robot aspirador con autovaciado, navegación PrecisionVision y mapeo inteligente', 'Robot aspirador autovaciado', 2899000, 2599000, 15, 5, 'IRB-J7PLUS', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 2, NULL, '["Black"]', '{"autovaciado":"Si","navegacion":"PrecisionVision","bateria":"75min","app":"iRobot Home"}', 'aspiradora,robot,irobot,limpieza', 1, 0, GETDATE(), GETDATE()),

    ('Cafetera DeLonghi Magnifica S', 'Cafetera automática con molinillo integrado, espumador de leche y 13 niveles de molienda', 'Cafetera automática premium', 1899000, NULL, 20, 5, 'DLG-MAGS', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&q=80', 2, NULL, '["Silver","Black"]', '{"molinillo":"Integrado","presion":"15 bar","deposito":"1.8L","niveles":"13"}', 'cafetera,delonghi,cafe,automatica', 1, 1, GETDATE(), GETDATE()),

    ('Juego de Sábanas King 400 hilos', 'Sábanas de algodón egipcio 400 hilos, suaves y transpirables, incluye 4 piezas', 'Sábanas algodón egipcio', 289000, 249000, 50, 10, 'HOM-SAB-K400', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80', 2, NULL, '["White","Gray","Navy","Beige"]', '{"material":"Algodón egipcio","hilos":"400","piezas":"4","tamano":"King"}', 'sabanas,hogar,algodon,king', 1, 0, GETDATE(), GETDATE()),

    -- Deportes
    ('Zapatillas Nike Air Max 270', 'Zapatillas con unidad Air Max visible para amortiguación todo el día', 'Zapatillas Air Max 270', 549000, 479000, 35, 10, 'NIK-AM270-42', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', 3, 3, '["Black/White","Red/Black","Blue/White"]', '{"talla":"42","suela":"Air Max","material":"Malla sintetica","peso":"310g"}', 'zapatillas,nike,running,air max', 1, 1, GETDATE(), GETDATE()),

    ('Bicicleta de Montaña Trek Marlin 7', 'Bicicleta MTB con cuadro de aluminio, suspensión RockShox y 10 velocidades', 'MTB aluminio 10v', 3299000, NULL, 8, 3, 'TRK-MLN7', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80', 3, NULL, '["Matte Black","Green"]', '{"cuadro":"Aluminio","suspension":"RockShox 100mm","velocidades":"10","rodado":"29"}', 'bicicleta,montana,trek,mtb', 1, 0, GETDATE(), GETDATE()),

    ('Mancuernas Ajustables Bowflex 24kg', 'Par de mancuernas ajustables de 2.5 a 24kg con selector rápido', 'Mancuernas ajustables 24kg', 1299000, 1149000, 10, 3, 'BFX-DB24', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80', 3, NULL, '["Black/Red"]', '{"peso":"2.5-24kg c/u","ajuste":"Selector rapido","material":"Acero plastificado"}', 'mancuernas,fitness,bowflex,pesas', 1, 1, GETDATE(), GETDATE()),

    -- Moda
    ('Chaqueta de Cuero Zara Premium', 'Chaqueta de cuero genuino con forro interior, corte slim fit', 'Chaqueta cuero premium', 459000, 389000, 22, 5, 'ZAR-CHC-M', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80', 4, 7, '["Black","Brown"]', '{"material":"Cuero genuino","corte":"Slim fit","talla":"M","forro":"Poliester"}', 'chaqueta,cuero,zara,moda', 1, 0, GETDATE(), GETDATE()),

    ('Vestido Floral H&M Verano', 'Vestido ligero estampado floral, perfecto para verano, tejido transpirable', 'Vestido floral verano', 159000, 129000, 40, 10, 'HM-VF-S', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80', 4, 8, '["Floral Blue","Floral Pink","Floral Green"]', '{"material":"Viscosa","talla":"S","largo":"Midi","estampado":"Floral"}', 'vestido,floral,hm,verano', 1, 0, GETDATE(), GETDATE()),

    -- Juguetes
    ('LEGO Technic Bugatti Chiron', 'Set LEGO de 3599 piezas que replica el icónico Bugatti Chiron con detalles funcionales', 'LEGO Bugatti 3599 piezas', 1899000, NULL, 12, 3, 'LEG-42083', 'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=600&q=80', 5, 9, '["Multicolor"]', '{"piezas":"3599","edad":"16+","dimensiones":"56x25x15cm","peso":"4.2kg"}', 'lego,bugatti,technic,coleccion', 1, 1, GETDATE(), GETDATE()),

    ('Peluche Gigante Oso 1.2m', 'Oso de peluche suave de 1.2 metros, ideal para regalo', 'Oso peluche 1.2m', 189000, 159000, 25, 5, 'TOY-OSO120', 'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=600&q=80', 5, NULL, '["Brown","White","Pink"]', '{"tamano":"1.2m","material":"Poliester hipoalergenico","peso":"1.8kg"}', 'peluche,oso,juguete,regalo', 1, 0, GETDATE(), GETDATE()),

    -- Belleza
    ('Set Skincare Coreano 10 Pasos', 'Kit completo de cuidado facial coreano con limpiador, tonico, serum, crema y más', 'Kit skincare coreano', 349000, 299000, 30, 8, 'BEA-SK10', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80', 7, NULL, '["Universal"]', '{"pasos":"10","tipo_piel":"Todo tipo","origen":"Corea del Sur","productos":"10 unidades"}', 'skincare,coreano,belleza,kit', 1, 1, GETDATE(), GETDATE()),

    -- Alimentos
    ('Café Colombiano Premium 1kg', 'Café de origen colombiano, tostado medio, notas de chocolate y frutos rojos', 'Café colombiano premium', 89000, 75000, 60, 15, 'ALM-CAF1KG', 'https://images.unsplash.com/photo-155905619?w=600&q=80', 8, NULL, '["N/A"]', '{"origen":"Colombia","tostado":"Medio","peso":"1kg","notas":"Chocolate, frutos rojos"}', 'cafe,colombiano,premium,gourmet', 1, 0, GETDATE(), GETDATE())
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'SAM-S24U-256');

-- 4. Direcciones para el usuario Juan (asumiendo que ya existe con id=2)
-- Nota: Ajustar el user_id segun el ID real del usuario juan@cliente.com
DECLARE @JuanId BIGINT;
SELECT @JuanId = id FROM users WHERE email = 'juan@cliente.com';

IF @JuanId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM addresses WHERE user_id = @JuanId)
    BEGIN
        INSERT INTO addresses (alias, calle, numero, ciudad, departamento, codigo_postal, referencia, es_principal, user_id, fecha_creacion, fecha_actualizacion)
        VALUES 
            ('Casa', 'Calle 123 #45-67', '101', 'Bogotá', 'Cundinamarca', '110111', 'Edificio azul, apto 501', 1, @JuanId, GETDATE(), GETDATE()),
            ('Oficina', 'Carrera 7 #71-21', 'Oficina 801', 'Bogotá', 'Cundinamarca', '110231', 'Torre Business Park', 0, @JuanId, GETDATE(), GETDATE());
    END
END

-- 5. Verificar stock de productos existentes (corregir productos con stock 0)
UPDATE products SET stock = 15 WHERE stock = 0 AND sku NOT IN ('SNY-WH1000XM5');
UPDATE products SET stock_minimo = 5 WHERE stock_minimo > stock AND stock > 0;

-- =====================================================
-- Fin del script
-- =====================================================

