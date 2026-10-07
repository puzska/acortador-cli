# Tareas de Implementación — Acortador de URLs Local (CLI)

Tareas estructuradas para completarse en <30 minutos cada una, ordenadas estrictamente por dependencias (de menor a mayor), con trazabilidad a los Requisitos Funcionales (RF) de la especificación y criterios de finalización verificables.

---

### [x] T1: Configuración inicial del proyecto y entorno de pruebas nativo
- **Requisitos cubiertos**: Base para RF-1 a RF-12.
- **Dependencias**: Ninguna.
- **Acciones**:
  - Inicializar `package.json` con soporte para módulos ES (`"type": "module"`).
  - Configurar script de ejecución y script de test con el runner nativo de Node.js (`"test": "node --test"`).
  - Crear la estructura de directorios (`src/core`, `src/storage`, `src/platform`, `src/cli`, `bin`, `test`).
- **Hecho cuando**: Ejecutar `npm test` reconoce la suite de pruebas nativa sin errores ni dependencias externas.

---

### [x] T2: Validador y normalizador de URLs con TDD (`src/core/validator.js`)
- **Requisitos cubiertos**: **RF-2**, **RF-4**.
- **Dependencias**: T1.
- **Acciones**:
  - Crear `test/validator.test.js` con casos para URLs válidas (`http`, `https`), URLs sin protocolo (autocompletar con `https://`), esquemas no permitidos (`ftp://`, `file://`), y URLs vacías o malformadas.
  - Implementar la función `validateAndNormalizeUrl(input)` en `src/core/validator.js`.
- **Hecho cuando**: `node --test test/validator.test.js` se ejecuta y pasa 100% en verde.

---

### [x] T3: Generador de identificadores alfanuméricos con prevención de colisiones con TDD (`src/core/generator.js`)
- **Requisitos cubiertos**: **RF-1**, **RF-5**.
- **Dependencias**: T1.
- **Acciones**:
  - Crear `test/generator.test.js` comprobando que genera strings de exactamente 6 caracteres alfanuméricos `[a-zA-Z0-9]` y que reintenta ante colisión mediante función comprobatoria inyectada.
  - Implementar `generateShortId(existsFn)` en `src/core/generator.js`.
- **Hecho cuando**: `node --test test/generator.test.js` se ejecuta y pasa 100% en verde con verificación de longitud, caracteres y reintento de colisiones.

---

### [x] T4: Almacenamiento local y persistencia con soporte de idempotencia con TDD (`src/storage/store.js`)
- **Requisitos cubiertos**: **RF-1**, **RF-3**, **RF-5**, **RF-8**, **RF-9**, **RF-10**, **RF-11**, **RF-12**.
- **Dependencias**: T1, T3.
- **Acciones**:
  - Crear `test/store.test.js` usando un archivo temporal para verificar: creación automática de archivo si no existe, guardado con idempotencia (misma URL devuelve mismo ID), consulta por ID, listado (vacío y con registros), y eliminación (éxito y error en inexistente).
  - Implementar la clase/módulo `LinkStore` en `src/storage/store.js` con persistencia en formato JSON plano.
- **Hecho cuando**: `node --test test/store.test.js` pasa 100% en verde verificando todas las operaciones CRUD e idempotencia.

---

### [x] T5: Adaptador de lanzamiento en navegador nativo del SO (`src/platform/launcher.js`)
- **Requisitos cubiertos**: **RF-6**.
- **Dependencias**: T1.
- **Acciones**:
  - Crear `test/launcher.test.js` comprobando que la función construye la llamada nativa correcta según la plataforma (`start` en Windows, `open` en macOS, `xdg-open` en Linux) de forma segura.
  - Implementar `openUrl(url, execFn)` en `src/platform/launcher.js` permitiendo inyección de comando para tests sin abrir navegadores reales en CI/test.
- **Hecho cuando**: `node --test test/launcher.test.js` pasa en verde comprobando los comandos para `win32`, `darwin` y `linux`.

---

### [x] T6: Interfaz de comandos de consola CLI y despachador con TDD (`src/cli/index.js` y `bin/acortador.js`)
- **Requisitos cubiertos**: **RF-1**, **RF-2**, **RF-3**, **RF-4**, **RF-5**, **RF-6**, **RF-7**, **RF-8**, **RF-9**, **RF-10**, **RF-11**, **RF-12**.
- **Dependencias**: T2, T3, T4, T5.
- **Acciones**:
  - Crear `test/cli.test.js` con pruebas de integración invocando el binario CLI mediante subprocesos para los comandos:
    - `acortar <url>` (éxito con exit code 0; URL inválida con error en stderr y exit code 1; idempotencia).
    - `abrir <id>` (éxito con exit code 0; ID inexistente con error en stderr y exit code 1).
    - `listar` (mensaje informativo si está vacío; listado tabular/limpio con registros existentes).
    - `eliminar <id>` (éxito con exit code 0; ID inexistente con error en stderr y exit code 1).
  - Implementar el despachador de argumentos en `src/cli/index.js` y el punto de entrada ejecutable en `bin/acortador.js`.
- **Hecho cuando**: `node --test test/cli.test.js` pasa 100% en verde validando todos los flujos de consola, códigos de salida (`0` / `1`) y canales `stdout` / `stderr`.

---

### [x] T7: Validación integral y actualización de comandos en documentación
- **Requisitos cubiertos**: **RF-1** a **RF-12**.
- **Dependencias**: T6.
- **Acciones**:
  - Ejecutar la suite completa de pruebas: `npm test`.
  - Realizar prueba manual en terminal ejecutando el flujo completo (acortar -> abrir -> listar -> eliminar).
  - Actualizar `acortador.cli/agents.md` con los comandos definitivos de ejecución, tests y lint del proyecto.
- **Hecho cuando**: Todos los tests de la suite pasan en verde, la prueba manual del flujo CLI es exitosa y `agents.md` queda actualizado sin placeholders `<comando>`.
