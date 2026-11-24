-- ============================================================================
-- APP NEW WORLD - Esquema y Datos Iniciales de Base de Datos (Servicios PRL)
-- Equivalente relacional del arreglo de objetos "servicios" en js/app.js
-- ============================================================================

CREATE TABLE IF NOT EXISTS servicios (
    id          INTEGER PRIMARY KEY,
    servicio    VARCHAR(120)   NOT NULL,
    precio      DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    categoria   VARCHAR(60)    NOT NULL,
    foto        VARCHAR(150)   NOT NULL,
    descripcion TEXT           NOT NULL
);

INSERT INTO servicios (id, servicio, precio, categoria, foto, descripcion) VALUES
(1, 'Seguridad en el trabajo', 0.00, 'Seguridad General', 'imagenes/imagen4.jpg',
 'Guía integral de prevención de riesgos laborales, señalización obligatoria, botiquín y plan PRL para toda obra.'),
(2, 'Caídas al mismo nivel', 0.00, 'Riesgos en Obra', 'imagenes/imagen1.jpg',
 'Medidas prácticas de orden, limpieza, superficies antideslizantes y rutas despejadas para evitar tropiezos y resbalones.'),
(3, 'Golpes y cortes', 0.00, 'Riesgos en Obra', 'imagenes/imagen3.jpg',
 'Prevención de lesiones con herramientas manuales y materiales usando guantes anticorte, casco, gafas y guardas de protección.'),
(4, 'Riesgos eléctricos', 0.00, 'Riesgos Técnicos', 'imagenes/imagen2.jpg',
 'Protocolos de seguridad en tableros provisionales, bloqueo y etiquetado (LOTO) y uso de EPP dieléctrico en obra.'),
(5, 'Riesgos ergonómicos y físicos', 0.00, 'Salud Laboral', 'imagenes/imagen5.jpg',
 'Técnicas de levantamiento seguro de cargas, control de ruido, polvo de sílice, vibraciones y pausas activas.'),
(6, 'Capacitaciones para la constructora', 35.00, 'Empresas', 'imagenes/imagen2.jpg',
 'Jornada presencial o virtual de inducción en PRL, uso obligatorio de EPP y cumplimiento IESS dirigida a cuadrillas y empresas constructoras.');

-- Consultas de ejemplo (equivalentes a filtrarServicios() en JavaScript)
-- 1. Todos los servicios:
-- SELECT * FROM servicios ORDER BY id;
--
-- 2. Solo servicios gratuitos para trabajadores:
-- SELECT id, servicio, precio FROM servicios WHERE precio = 0.00;
--
-- 3. Servicios pagados para empresas constructoras:
-- SELECT id, servicio, precio FROM servicios WHERE categoria = 'Empresas';
