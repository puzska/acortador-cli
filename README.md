# Acortador de URLs Local (CLI)

[![Node.js](https://img.shields.io/badge/Node.js-24%2B-green.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/tests-28%20pass%20%7C%200%20fail-brightgreen.svg)](test/)
[![Dependencies](https://img.shields.io/badge/dependencies-0%20external-blue.svg)](package.json)
[![Methodology](https://img.shields.io/badge/methodology-SDD%20(Spec--Driven%20Development)-orange.svg)](docs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Un acortador de URLs local y ligero para la línea de comandos, diseñado para ejecutarse 100% en tu máquina sin servidores externos, sin bases de datos remotas y **con cero dependencias de terceros**.

Desarrollado íntegramente bajo la metodología **SDD (Spec-Driven Development)**: Constitución -> Spec (EARS) -> Plan -> Tareas -> TDD -> Validación.

---

## Características

- **100% Local y Privado**: No requiere servidores en la nube, APIs externas ni telemetría. Todos los datos permanecen en tu equipo.
- **Cero Dependencias Externas**: Construido utilizando exclusivamente las APIs nativas de Node.js (`node:test`, `node:crypto`, `node:fs`, `node:child_process`).
- **Comportamiento Idempotente**: Si acortas una URL que ya existe en el sistema, reutiliza el identificador existente sin duplicar registros.
- **Validación Robusta**: Autocompleta esquemas si falta el protocolo (`https://`), valida sintaxis estricta y previene colisiones de identificadores.
- **Apertura Nativa en Navegador**: Abre enlaces directamente en el navegador predeterminado del sistema operativo (compatible con Windows, macOS y Linux).
- **Persistencia Automática**: Conserva los enlaces entre reinicios mediante almacenamiento JSON local.

---

## Instalación y Configuración

### Requisitos previos
- [Node.js](https://nodejs.org/) (versión 20 o superior, recomendado 24+).

### 1. Clonar el repositorio
```bash
git clone https://github.com/<tu-usuario>/acortador-cli.git
cd acortador-cli
```

### 2. (Opcional) Instalar globalmente como comando del sistema
Para poder ejecutar `acortador` desde cualquier terminal:
```bash
npm link
```

---

## Guía de Uso

Puedes usarlo directamente con `node bin/acortador.js` o con el comando global `acortador`:

### 1. Acortar una URL
Genera un identificador único alfanumérico de 6 caracteres:
```bash
acortador acortar https://developer.mozilla.org
```
> *Si omites el protocolo (por ejemplo `acortador acortar github.com`), se autocompletará automáticamente a `https://github.com`.*

**Salida:**
```text
Identificador: a8K2m9
URL: https://developer.mozilla.org/
Comando para abrir: acortador abrir a8K2m9
```

### 2. Abrir un enlace en el navegador
Abre la URL original en tu navegador web predeterminado:
```bash
acortador abrir a8K2m9
```

### 3. Listar todos los enlaces guardados
Muestra todos los enlaces acortados con su identificador, URL y fecha:
```bash
acortador listar
```

**Salida:**
```text
Enlaces guardados (2):
- [a8K2m9] -> https://developer.mozilla.org/ (2026-10-07T19:00:00.000Z)
- [vePfoe] -> https://es.wikipedia.org/ (2026-10-07T19:30:00.000Z)
```

### 4. Eliminar un enlace
Elimina el enlace del almacenamiento local:
```bash
acortador eliminar a8K2m9
```

### 5. Ayuda
```bash
acortador --help
```

---

## Suite de Pruebas

El proyecto cuenta con una cobertura completa de pruebas unitarias y de integración utilizando el runner nativo `node:test`:

```bash
npm test
```

Ejecuta 28 pruebas que cubren:
- Validación y normalización de URLs (esquemas soportados, errores, autocompletado).
- Generación de identificadores alfanuméricos y resolución de colisiones.
- Almacenamiento local con persistencia, idempotencia, listado y borrado.
- Lanzador multiplataforma de navegador (`win32`, `darwin`, `linux`).
- Ejecución e integración del CLI (códigos de salida, canales `stdout`/`stderr`).

---

## Estructura del Proyecto

```text
acortador.cli/
├── bin/
│   └── acortador.js          # Punto de entrada ejecutable
├── src/
│   ├── core/
│   │   ├── generator.js      # Generación de IDs alfanuméricos y prevención de colisiones
│   │   └── validator.js      # Validación y normalización de URLs
│   ├── storage/
│   │   └── store.js          # Persistencia y repositorio local (JSON)
│   ├── platform/
│   │   └── launcher.js       # Integración con el navegador nativo del SO
│   └── cli/
│       └── index.js          # Despachador de comandos CLI y formateo
├── test/
│   ├── cli.test.js           # Tests de integración CLI
│   ├── generator.test.js     # Tests del generador de IDs
│   ├── launcher.test.js      # Tests del lanzador de navegador
│   ├── store.test.js         # Tests del almacenamiento y persistencia
│   └── validator.test.js     # Tests del validador de URLs
├── docs/                     # Documentación de la metodología SDD
│   ├── constitution.md       # Principios no negociables del proyecto
│   ├── spec.md               # Especificación funcional formal en EARS
│   ├── plan.md               # Plan de arquitectura y diseño
│   └── tasks.md              # Desglose de tareas con criterios verificables
├── agents.md                 # Guía para agentes de IA en el proyecto
├── package.json
├── LICENSE
└── README.md
```

---

## Metodología SDD (Spec-Driven Development)

Este proyecto fue concebido y desarrollado siguiendo el ciclo formal SDD:
1. **[Constitución](docs/constitution.md)**: 7 principios concisos y verificables sobre stack, calidad, tests y límites locales.
2. **[Especificación](docs/spec.md)**: 12 Requisitos Funcionales en sintaxis EARS, casos límite y criterios de finalización.
3. **[Plan de Arquitectura](docs/plan.md)**: Módulos desacoplados, modelo de datos y decisiones técnicas justificadas.
4. **[Tareas](docs/tasks.md)**: Tareas ordenadas por dependencias con criterios `Hecho cuando:` verificables.
5. **Implementación TDD**: Tests unitarios e integración desarrollados antes de cada módulo funcional.
6. **Validación**: Comprobación del 100% de los requisitos funcionales con suite automatizada en verde.

---

## Licencia

Este proyecto está bajo la Licencia [MIT](LICENSE).
