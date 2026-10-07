# Plan de Arquitectura y Diseño — Acortador de URLs Local (CLI)

## 1. Módulos del Sistema

El diseño se estructura en módulos desacoplados con responsabilidades únicas:

- **`core/validator` (Validador y Normalizador de URLs)**:
  - Responsabilidad: Analiza cadenas de texto ingresadas, antepone `https://` si se omite el esquema de protocolo y valida la conformidad sintáctica con el estándar URL (`http:` o `https:`).
  - Cobertura: **RF-2**, **RF-4**.

- **`core/generator` (Generador de Identificadores)**:
  - Responsabilidad: Produce identificadores alfanuméricos compactos de 6 caracteres (`[a-zA-Z0-9]`). Gestiona la resolución de colisiones consultando al almacenamiento antes de confirmar un ID.
  - Cobertura: **RF-1**, **RF-5**.

- **`storage/store` (Almacenamiento y Persistencia Local)**:
  - Responsabilidad: Inicializa el archivo local si no existe, gestiona la persistencia de las asociaciones URL <-> ID, verifica idempotencia (búsqueda inversa por URL), previene duplicados y expone operaciones de consulta y eliminación.
  - Cobertura: **RF-1**, **RF-3**, **RF-5**, **RF-8**, **RF-9**, **RF-10**, **RF-11**, **RF-12**.

- **`platform/launcher` (Lanzador de Navegador del SO)**:
  - Responsabilidad: Detecta el sistema operativo y ejecuta la instrucción nativa correspondiente (`start` en Windows, `open` en macOS, `xdg-open` en Linux) para abrir la URL resuelta en el navegador predeterminado.
  - Cobertura: **RF-6**, **RF-7**.

- **`cli/interface` (Interfaz de Línea de Comandos y Despachador)**:
  - Responsabilidad: Procesa los argumentos de consola (`acortar`, `abrir`, `listar`, `eliminar`), delega en los módulos correspondientes, formatea salidas limpias en `stdout`, canaliza errores a `stderr` y fija los códigos de salida (`0` para éxito, `1` para error).
  - Cobertura: **RF-1** a **RF-12**.

---

## 2. Modelo de Datos

### 2.1 Entidad `Link` (Registro de Enlace)

Cada enlace registrado se modela con la siguiente estructura:

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `id` | `string` | 6 caracteres alfanuméricos, clave primaria única | Identificador corto autogenerado. |
| `url` | `string` | URL válida con esquema `http:` o `https:` | Destino original normalizado. |
| `createdAt` | `string` | Formato ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) | Fecha y hora de creación. |

### 2.2 Esquema de Persistencia Local

- **Archivo físico**: `links.json` ubicado en el directorio de datos local de la aplicación.
- **Estructura en disco**: Objeto JSON que indexa registros por `id` y mantiene un índice inverso implícito o explícito por `url` para garantizar idempotencia en tiempo constante $O(1)$ o lineal acotado:
  ```json
  {
    "links": {
      "x8k2m9": {
        "id": "x8k2m9",
        "url": "https://developer.mozilla.org",
        "createdAt": "2026-10-07T19:00:00.000Z"
      }
    }
  }
  ```

---

## 3. Decisiones Justificadas y Alternativas Descartadas

### Decisión 1: Persistencia en archivo JSON local plano
- **Justificación**: Cumple estrictamente con la Constitución (Principios 1, 2 y 6): funcionamiento 100% local, cero dependencias externas de compiladores o drivers, fácil inspección y tiempos de acceso inmediatos (<10 ms).
- **Alternativa descartada**: *SQLite / Base de datos relacional*. Descartada porque requiere dependencias externas con binarios nativos (C/C++ bindings) o dependencias pesadas innecesarias para la escala y simplicidad de un CLI local.

### Decisión 2: Identificador alfanumérico pseudoaleatorio de 6 caracteres
- **Justificación**: Ofrece $62^6 \approx 5.68 \times 10^{10}$ combinaciones posibles, minimizando colisiones a niveles insignificantes mientras mantiene el identificador corto, fácil de leer y rápido de teclear.
- **Alternativa descartada**: *Contador secuencial (1, 2, 3...)*. Descartada porque revela volumen interno, no parece un identificador corto estándar y complica la idempotencia ante borrados intercalados.
- **Alternativa descartada**: *UUID v4*. Descartada por ser excesivamente largo (36 caracteres) para el propósito de un acortador.

### Decisión 3: Suite de pruebas nativa (`node:test` y `node:assert`)
- **Justificación**: Incluida de forma nativa en Node.js (disponible en v24), ofrece ejecución inmediata sin descargar ni compilar frameworks adicionales, alineándose con el principio de minimalismo.
- **Alternativa descartada**: *Jest / Vitest / Mocha*. Descartadas por agregar decenas de megabytes de dependencias auxiliares, archivos de configuración extra y complejidad innecesaria.

### Decisión 4: Invocación de navegador mediante comandos nativos del SO
- **Justificación**: No requiere dependencias de terceros; detecta `process.platform` y delega en el comando del sistema (`start` en Windows, `open` en macOS, `xdg-open` en Linux/BSD).
- **Alternativa descartada**: *Librería externa `open`*. Descartada para evitar añadir dependencias que no están justificadas.

---

## 4. Estrategia de Tests

La suite de pruebas se organizará en dos capas verificables mediante `npm test` o `node --test`:

### 4.1 Tests Unitarios
1. **Validador (`test/validator.test.js`)**:
   - URL válida con `http://` y `https://` -> pasa validación.
   - URL sin esquema (ej. `midominio.com/ruta`) -> autocompleta con `https://` y pasa.
   - URLs inválidas (espacios, caracteres prohibidos, esquema `ftp://`, texto aleatorio) -> rechazo con error.
2. **Generador (`test/generator.test.js`)**:
   - Longitud exacta de 6 caracteres.
   - Caracteres estrictamente alfanuméricos (`[a-zA-Z0-9]`).
   - Reintento y resolución ante colisión simulada.
3. **Almacenamiento (`test/store.test.js`)**:
   - Creación automática del archivo si no existe.
   - Guardado y recuperación por ID.
   - Idempotencia: guardar la misma URL dos veces devuelve el mismo ID sin duplicar registros.
   - Eliminación por ID existente (éxito) y no existente (error).
   - Listado de registros ordenados o formateados, y manejo de lista vacía.

### 4.2 Tests de Integración / CLI (`test/cli.test.js`)
- Ejecución de comandos del CLI mediante subprocesos y verificación de `stdout`, `stderr` y códigos de salida:
  - Comando `acortar`: código de salida `0`, salida con ID, verificación de persistencia.
  - Comando `acortar` con error: código de salida `1`, mensaje explicativo en `stderr`.
  - Comando `listar`: salida legible con tabla o lista de enlaces registrados; mensaje adecuado si está vacío.
  - Comando `eliminar`: eliminación exitosa con código `0`; intento de eliminar ID inexistente con código `1`.
  - Comando `abrir`: verificación de llamada con ID válido y reporte de error (código `1`) con ID inexistente.

---

## 5. Matriz de Trazabilidad (Requisitos Funcionales vs Módulos y Tests)

| Requisito Funcional | Módulo Responsable | Test Unitario / Integración |
|---|---|---|
| **RF-1** (Acortar URL y emitir ID) | `core/generator`, `storage/store`, `cli/interface` | `generator.test.js`, `store.test.js`, `cli.test.js` |
| **RF-2** (Autocompletar esquema `https://`) | `core/validator` | `validator.test.js` |
| **RF-3** (Idempotencia de URL duplicada) | `storage/store` | `store.test.js`, `cli.test.js` |
| **RF-4** (Error en URL inválida) | `core/validator`, `cli/interface` | `validator.test.js`, `cli.test.js` |
| **RF-5** (Prevención de colisiones de ID) | `core/generator`, `storage/store` | `generator.test.js`, `store.test.js` |
| **RF-6** (Abrir en navegador por defecto) | `platform/launcher`, `cli/interface` | `launcher.test.js`, `cli.test.js` |
| **RF-7** (Error ID inexistente al abrir) | `storage/store`, `cli/interface` | `store.test.js`, `cli.test.js` |
| **RF-8** (Listado de enlaces) | `storage/store`, `cli/interface` | `store.test.js`, `cli.test.js` |
| **RF-9** (Listado vacío) | `storage/store`, `cli/interface` | `store.test.js`, `cli.test.js` |
| **RF-10** (Eliminar enlace existente) | `storage/store`, `cli/interface` | `store.test.js`, `cli.test.js` |
| **RF-11** (Error al eliminar ID inexistente) | `storage/store`, `cli/interface` | `store.test.js`, `cli.test.js` |
| **RF-12** (Persistencia local íntegra) | `storage/store` | `store.test.js`, `cli.test.js` |
