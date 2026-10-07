# Agentes del proyecto: acortador de URLs local

## Objetivo

Crear una aplicación local que convierta URLs largas en enlaces cortos y permita abrirlos desde el mismo equipo donde se ejecuta la aplicación.

La aplicación no se debe desplegar ni depender de hosting, servicios externos, APIs en la nube o bases de datos remotas. Los enlaces locales no son accesibles desde Internet ni necesariamente desde otros dispositivos.

## Alcance funcional

- Permitir ingresar una URL y generar un identificador corto único.
- Mostrar el enlace corto local y permitir copiarlo.
- Al abrir el enlace corto, redirigir a la URL original.
- Conservar los enlaces entre reinicios mediante almacenamiento local, de acuerdo con la arquitectura existente.
- Validar las URLs antes de guardarlas y mostrar errores claros si no son válidas.
- Evitar colisiones entre identificadores cortos.

## Comandos del proyecto

Usa los comandos definidos por los archivos de configuración del proyecto. No inventes comandos ni agregues herramientas sin necesidad.

- Ejecutar en local: `node bin/acortador.js <comando> [argumentos]`
- Tests: `npm test`
- Lint/formato: `node --check src/core/*.js src/storage/*.js src/platform/*.js src/cli/*.js bin/*.js`

## Estilo y convenciones

- Sigue el lenguaje, framework, estructura, formato y convenciones que ya use el repositorio.
- Mantén el código, nombres y mensajes consistentes con el idioma usado en el proyecto.
- Escribe la documentación en español y en Markdown.
- Prefiere cambios pequeños y reutiliza las dependencias y utilidades existentes.

## Reglas de trabajo

- Lee `docs/constitution.md` y la especificación activa antes de modificar código.
- Mantén el funcionamiento limitado a la máquina local; no agregues despliegues, telemetría ni comunicación con servicios externos.
- No guardes URLs ni datos del usuario fuera del almacenamiento local del proyecto.
- No añadas dependencias, funciones o cambios de alcance importantes sin justificarlos.
- No incluyas credenciales ni datos sensibles en el código o la documentación.

## Al terminar cualquier tarea

- Ejecuta los tests relacionados y las comprobaciones de formato o lint disponibles.
- Verifica que la aplicación pueda ejecutarse localmente y que el acortamiento y la redirección funcionen.
- Informa qué cambió, qué comandos ejecutaste y cualquier comprobación que no haya sido posible realizar.
