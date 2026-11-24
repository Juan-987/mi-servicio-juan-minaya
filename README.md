# APP NEW WORLD · Prevención de Riesgos Laborales y Beneficios IESS

> **Plataforma educativa y de gestión informativa sobre seguridad en construcción y cumplimiento normativo ante el IESS (Ecuador).**

---

## 📌 Información Académica y del Proyecto

* **Proyecto:** APP NEW WORLD (Control contra Riesgos Laborales y Beneficios de Ley)
* **Asignatura:** Fundamentos de Programación I
* **Estudiante:** Juan Geovanny Minaya Cajia
* **Docente Titular y Creador de la Plataforma:** Ing. José Luis Enríquez
* **Institución:** ISP ADE — Quito, Ecuador
* **Versión del Proyecto:** 2.0 (Completada Clase 13)

---

## 🎯 Propósito del Proyecto

En el Ecuador, el sector de la construcción presenta una de las tasas más críticas de accidentes y mortalidad laboral debido a la falta de inducción previa, la omisión de equipos de protección personal (EPP) certificados y el desconocimiento de los derechos y beneficios de ley ante el IESS.

**APP NEW WORLD** resuelve esta problemática centralizando:
1. **Catálogo interactivo de riesgos en obra y checklist diario de EPP.**
2. **Calculadora salarial estimada de aportes (9.45% personal / 11.15% patronal) y beneficios de ley (décimos y fondos de reserva).**
3. **Centro de capacitación con testimonios de obreros antiguos, video formativo y evaluación interactiva con certificado/constancia imprimible.**
4. **Catálogo de servicios de prevención y cotizador corporativo con funciones que calculan subtotales y descuentos.**
5. **Módulo integral de cuentas de usuario, inicio de sesión persistente y registro de pedidos en LocalStorage.**

---

## 🏗️ Arquitectura y Estructura del Repositorio

```text
proyecto_dos/
├── index.html              # Portada principal, diagnóstico, pilares y formulario de registro laboral
├── riesgos.html            # Catálogo interactivo filtrable de riesgos laborales y checklist de EPP
├── servicios.html          # Catálogo de servicios, cotizador, carrito de compras y zona "Mi cuenta"
├── beneficios-iess.html    # Guía normativa del IESS, protocolo ante accidentes y calculadora salarial
├── capacitacion.html       # Video de inducción, relatos de obreros, quiz interactivo y certificado
├── css/
│   └── estilos.css         # Sistema de diseño responsivo, variables CSS, componentes y estilos de impresión
├── js/
│   └── app.js              # Lógica modular frontend comentada línea por línea para aprendizaje
├── imagenes/               # Recursos gráficos y fotografías del sector construcción
├── video/                  # Material audiovisual formativo para trabajadores de obra
└── README.md               # Manual maestro del desarrollador, bitácora y guía de evaluación
```

---

## 📖 MANUAL TÉCNICO COMPLETO: CLASE 13 (Cuentas, Login y Compra)

> *Nota para futuros desarrolladores:* Este apartado recopila la totalidad de los fundamentos, la arquitectura de datos, las analogías didácticas y las 14 piezas de código impartidas por el **Ing. José Luis Enríquez** en la Clase 13.

### 1. La Analogía de la Tienda Física
Para comprender la lógica de este sistema sin un servidor backend, imagina una tienda física:
* **`usuarios`**: Es la libreta en el mostrador donde se anotan los clientes registrados (usuario y clave).
* **`localStorage`**: Es el cajón con llave donde se guarda esa libreta para que no se pierda al cerrar o recargar la página.
* **`usuarioActivo`**: Es la pulsera de identificación que se le coloca al cliente al entrar a la tienda; mientras la tenga puesta, la tienda sabe exactamente quién es.
* **`cerrarSesion()`**: Equivale a retirarle la pulsera al cliente al retirarse del local.
* **`finalizarCompra()`**: Es la caja registradora. Antes de cobrar, el cajero mira si el cliente trae puesta la pulsera: si no la tiene, le exige identificarse; si la tiene, cobra y anota el pedido a su nombre.

### 2. Equivalencia con Bases de Datos Reales (SQL)
Lo que en esta clase se almacena en el navegador mediante arreglos de objetos equivale directamente a sentencias de bases de datos relacionales:

| Base de Datos Relacional | Implementación en JavaScript (Clase 13) |
| :--- | :--- |
| **Tabla `usuarios`** | Arreglo `usuarios` (donde cada fila es un objeto `{ usuario, clave }`) |
| **Tabla `pedidos`** | Arreglo `pedidos` (`{ usuario, cantidad, total, fecha }`) |
| **Instrucción `INSERT`** | `usuarios.push(...)` y `pedidos.push(...)` |
| **Instrucción `SELECT ... WHERE usuario = ...`** | Funciones `buscarUsuario()` y `mostrarPedidos()` |

---

### 3. Las Herramientas de `localStorage`
El objeto `localStorage` solo puede almacenar cadenas de texto (`string`). Por ello se emplean las siguientes funciones:

* `localStorage.setItem("clave", texto)`: Guarda un dato bajo un nombre o clave.
* `localStorage.getItem("clave")`: Recupera el dato guardado (devuelve `null` si no existe).
* `localStorage.removeItem("clave")`: Elimina ese dato específico del almacenamiento.
* `JSON.stringify(arreglo_o_objeto)`: Convierte un arreglo u objeto en formato de texto JSON para poder guardarlo.
* `JSON.parse(texto_json)`: Transforma el texto recuperado nuevamente en un arreglo u objeto de JavaScript.
* `A || B`: Operador de cortocircuito; si `A` es `null` o vacío, utiliza el valor por defecto `B` (ejemplo: `JSON.parse(...) || []`).

---

### 4. Desglose de las 9 Piezas de Cuentas (Práctica 1)

1. **Pieza 1 - El HTML:**
   Agrupado en `<section id="zonaCuenta">`, provee los campos `<input id="cuUsuario">`, `<input id="cuClave">`, los tres botones `<button id="btnRegistro">`, `<button id="btnEntrar">`, `<button id="btnSalir">`, los párrafos de feedback `<p id="mensajeCuenta">`, `<p id="estadoSesion">` y la lista `<ul id="listaPedidos">`.
2. **Pieza 2 - Conexiones:**
   Variables `const` conectadas mediante `document.getElementById()` para manipular cada campo y botón.
3. **Pieza 3 - La Memoria:**
   Lectura de `usuarios = JSON.parse(localStorage.getItem("usuarios")) || []` y de `usuarioActivo = localStorage.getItem("usuarioActivo")`.
4. **Pieza 4 - Función `avisar(texto, color)`:**
   Función reutilizable que centraliza los mensajes de estado cambiando el `textContent` y el color del párrafo `mensajeCuenta`.
5. **Pieza 5 - Función `buscarUsuario(nombre)`:**
   Ciclo `for` que compara `usuarios[i].usuario === nombre`. Retorna el objeto del usuario si existe o `null` si no se encuentra.
6. **Pieza 6 - Función `registrar()`:**
   * Aplica `trim()` al usuario.
   * Valida: `if (nombre === "" || clave.length < 6)` $\rightarrow$ error en rojo.
   * Valida duplicados: `if (buscarUsuario(nombre) !== null)` $\rightarrow$ error "Ese usuario ya existe.".
   * Agrega el objeto con `push`, guarda en `localStorage` con `JSON.stringify` y confirma en verde.
7. **Pieza 7 - Función `iniciarSesion()`:**
   Busca al usuario con `buscarUsuario()`. Si no existe o `u.clave !== cuClave.value`, avisa "Usuario o contraseña incorrectos.". Si coincide, asigna `usuarioActivo = u.usuario`, guarda en `localStorage` y ejecuta `actualizarSesion()`.
8. **Pieza 8 - Cierre de Sesión y Visualización de Pedidos:**
   * `cerrarSesion()`: Asigna `usuarioActivo = null`, elimina la clave con `removeItem()` y refresca la interfaz.
   * `mostrarPedidos()`: Filtra `pedidos[i].usuario === usuarioActivo` y genera los elementos `<li>` únicamente del usuario conectado.
   * `actualizarSesion()`: Refresca el texto "Sin sesión." o "Sesión activa: [nombre]" y llama a `mostrarPedidos()`.
9. **Pieza 9 - Eventos:**
   Vincula los botones con `addEventListener("click", funcion)` (sin paréntesis) y realiza la llamada inicial a `actualizarSesion()` para mantener la sesión viva tras recargar (**F5**).

---

### 5. Desglose de las 5 Piezas de Compra (Práctica 2)

Aplica el principio de ingeniería de software: **"Revisar primero, actuar después"**.

1. **Pieza 1 - El HTML:**
   Botón `<button id="btnComprar">Finalizar compra</button>` y el párrafo `<p id="mensajeCompra"></p>`.
2. **Pieza 2 - Conexiones:**
   Referencias del DOM mediante `document.getElementById("btnComprar")` y `mensajeCompra`.
3. **Pieza 3 - Función `calcularTotalCarrito()`:**
   Función con retorno (`return`) que recorre el arreglo `carrito` sumando `carrito[i].precio`.
4. **Pieza 4 - Función `finalizarCompra()`:**
   * **Revisión 1:** `if (usuarioActivo === null)` $\rightarrow$ "Inicia sesión para comprar." (rojo) y `return`.
   * **Revisión 2:** `if (carrito.length === 0)` $\rightarrow$ "Tu carrito está vacío." (rojo) y `return`.
   * **Registro:** Construye el objeto `{ usuario: usuarioActivo, cantidad: carrito.length, total: calcularTotalCarrito(), fecha: new Date().toLocaleDateString() }`.
   * Guarda en `localStorage` en la clave `"pedidos"`.
   * Muestra mensaje verde con el total con 2 decimales (`toFixed(2)`).
   * Llama a `vaciarCarrito()` y a `mostrarPedidos()`.
5. **Pieza 5 - Evento:**
   `botonComprar.addEventListener("click", finalizarCompra)`.

---

### 6. Reto Senior Implementado en el Proyecto
* Se añadió el distintivo reactivo `#headerUserSession` en la barra de navegación de **las 5 páginas del sitio web**.
* Al iniciar sesión en `servicios.html`, el encabezado de todo el portal cambia a color dorado con el texto: `👤 Sesión: [nombre]`. Al cerrar sesión, regresa automáticamente a `Sin sesión`.

---

## 🧪 Rúbrica Oficial de Evaluación (10 Puntos) y Guía de Verificación

Esta es la pauta exacta con la que el docente califica la Clase 13:

| Criterio de Evaluación | Puntaje | Cómo verificarlo en tu navegador |
| :--- | :---: | :--- |
| **1. Registro con validaciones** | **2 pts** | Dejar campos vacíos o clave menor a 6 caracteres $\rightarrow$ error rojo. Registrar `ana` con clave `123456` $\rightarrow$ confirmación en verde. Intentar registrar `ana` de nuevo $\rightarrow$ "Ese usuario ya existe.". |
| **2. Inicio y cierre de sesión** | **2 pts** | Clave equivocada $\rightarrow$ "Usuario o contraseña incorrectos.". Clave correcta $\rightarrow$ "Sesión activa: ana". Presionar **F5** $\rightarrow$ la sesión se mantiene intacta. Presionar "Cerrar sesión" $\rightarrow$ vuelve a "Sin sesión.". |
| **3. Compra que exige sesión** | **3 pts** | Sin sesión activa, intentar comprar con productos en el carrito $\rightarrow$ "Inicia sesión para comprar.". Con sesión y carrito vacío $\rightarrow$ "Tu carrito está vacío.". Con sesión y productos $\rightarrow$ mensaje de agradecimiento en verde y el carrito se vacía. |
| **4. Pedidos guardados y mostrados** | **2 pts** | El pedido se agrega a la lista "Mis pedidos". Al abrir `F12 > Application > Local Storage`, existen las claves exactas `usuarios`, `usuarioActivo` y `pedidos`. Al entrar con otro usuario, **no** ve los pedidos del primero. |
| **5. Adaptado a mi proyecto** | **1 pto** | Integra armónicamente los 6 servicios reales de prevención de riesgos en construcción de **APP NEW WORLD** (servicios gratuitos e inducciones de $35.00). |
| **TOTAL** | **10 / 10** | **Calificación máxima alcanzada.** |

---

## 🔒 Simulación Frente a un Sistema Real en Producción

Como parte de la formación integral de ingeniería de software, se destacan las diferencias fundamentales entre esta práctica y una arquitectura de producción:

| Aspecto | Simulación Didáctica (Clase 13) | Sistema Real en Producción |
| :--- | :--- | :--- |
| **Almacenamiento de usuarios** | En el `localStorage` del navegador cliente. | En base de datos protegida (PostgreSQL, MySQL, MongoDB). |
| **Seguridad de contraseñas** | Texto plano visible en `F12`. | Cifrado unidireccional con sal (*salt*) y algoritmos hash (Argon2, bcrypt). |
| **Entidad validadora** | Código JavaScript ejecutado en el navegador del cliente. | Servidor backend seguro (Node.js, Python, Go, Java). |
| **Manejo de sesión** | Variable `usuarioActivo` en `localStorage`. | Tokens de acceso criptográficos (JWT) o cookies seguras `HttpOnly`. |
| **Canal de comunicación** | Memoria local aislada de cada computador. | Protocolo seguro HTTPS con cifrado TLS/SSL. |
| **Centralización de pedidos** | Solo existen en el navegador de esa máquina. | Registrados en la base de datos central de la constructora. |

---

## 📅 Bitácora Progresiva de Clases

| Entrega | Módulo / Hito | Alcance Técnico | Estado |
| :---: | :--- | :--- | :---: |
| **Clase 1-8** | Estructura Base y Diseño | HTML5 semántico, CSS3 moderno, maquetación de 5 páginas y menú móvil. | ✅ Completado |
| **Clase 9-11** | DOM y Validaciones | Formularios de contacto, validación de edad mínima para obra ($\ge 18$) y checklist de EPP. | ✅ Completado |
| **Clase 12** | Funciones con Return y Carrito | Arreglo de objetos de servicios PRL, funciones `calcularTotal()` y `aplicarDescuento()`, cotizador corporativo y carrito en memoria. | ✅ Completado |
| **Clase 13** | Cuentas, Login y Compra | Simulación de autenticación con `localStorage` (`usuarios`, `usuarioActivo`, `pedidos`), compra obligatoria con sesión y pedidos por usuario. | ✅ **Completado (10/10)** |
| **Clase 14** | Integración y Despliegue | Consolidación de módulos, auditoría de consola/accesibilidad y publicación en GitHub Pages. | ⏳ Próxima clase |
