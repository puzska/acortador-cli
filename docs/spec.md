# Spec 001 — Acortador de URLs Local (CLI)

## Contexto y objetivo

La herramienta permite a los desarrolladores y usuarios locales convertir URLs largas en identificadores cortos y manejables directamente desde su terminal, persistirlos en su máquina y abrir la URL de destino en su navegador predeterminado mediante comandos de consola. El propósito es ofrecer una solución rápida, privada y 100% local, sin depender de servicios web externos, bases de datos remotas ni servidores HTTP permanentes.

## Usuarios / actores

- **Usuario de consola (CLI)**: Persona que interactúa con la terminal para registrar enlaces, abrirlos, listarlos y gestionarlos en su entorno de trabajo local.

## Historias de usuario

- **H1**: Como usuario de consola, quiero ingresar una URL para obtener un identificador corto y único que pueda copiar de la terminal.
- **H2**: Como usuario de consola, quiero usar un identificador corto para abrir la URL original directamente en mi navegador predeterminado.
- **H3**: Como usuario de consola, quiero listar todos los enlaces almacenados para consultar su identificador, destino y fecha.
- **H4**: Como usuario de consola, quiero eliminar enlaces existentes para mantener organizado mi almacenamiento local.

## Requisitos funcionales (criterios de aceptación en EARS)

- **RF-1**: CUANDO el usuario ejecuta el comando para acortar con una URL válida (con protocolo `http://` o `https://`), EL SISTEMA genera un identificador alfanumérico único de longitud fija (6 caracteres), persiste la relación en el almacenamiento local y muestra el identificador por salida estándar (`stdout`).
- **RF-2**: CUANDO el usuario ingresa una URL sin esquema de protocolo, EL SISTEMA antepone automáticamente `https://` y valida la URL resultante antes de procesarla.
- **RF-3**: CUANDO el usuario solicita acortar una URL que ya existe en el almacenamiento local, EL SISTEMA devuelve el identificador previamente asociado sin crear registros duplicados (idempotencia).
- **RF-4**: SI el usuario ingresa una URL con formato inválido o esquema no soportado, ENTONCES EL SISTEMA muestra un mensaje de error descriptivo en `stderr` y finaliza con código de salida no cero sin persistir información.
- **RF-5**: MIENTRAS se genera un nuevo identificador, EL SISTEMA verifica que dicho identificador no exista previamente en el almacenamiento local; si colisiona, genera uno nuevo hasta garantizar unicidad.
- **RF-6**: CUANDO el usuario ejecuta el comando de apertura con un identificador registrado, EL SISTEMA resuelve la URL original asociada y solicita al sistema operativo abrirla en el navegador web predeterminado.
- **RF-7**: SI el usuario intenta abrir un identificador no registrado, ENTONCES EL SISTEMA emite un mensaje de error en `stderr` indicando que el identificador no existe y finaliza con código de salida no cero.
- **RF-8**: CUANDO el usuario ejecuta el comando de listado, EL SISTEMA muestra por salida estándar todos los enlaces almacenados, detallando identificador, URL original y fecha de creación.
- **RF-9**: SI el usuario ejecuta el comando de listado y no existen enlaces guardados, ENTONCES EL SISTEMA muestra un mensaje informativo en `stdout` indicando que no hay registros.
- **RF-10**: CUANDO el usuario ejecuta el comando de eliminación con un identificador registrado, EL SISTEMA borra el registro del almacenamiento local y emite una confirmación de éxito por salida estándar.
- **RF-11**: SI el usuario intenta eliminar un identificador no registrado, ENTONCES EL SISTEMA emite un mensaje de error en `stderr` y finaliza con código de salida no cero.
- **RF-12**: EL SISTEMA mantiene la persistencia local de todas las operaciones entre reinicios y ejecuciones consecutivas.

## Requisitos no funcionales

- **Entorno 100% Local**: Sin conexiones salientes a APIs externas, sin telemetría y sin dependencias en la nube.
- **Rendimiento**: Ejecución de comandos inmediata (<100 ms para operaciones locales sobre el almacenamiento).
- **Códigos de salida**: Código `0` para operaciones exitosas en `stdout`; código distinto de `0` para fallos o errores de validación en `stderr`.
- **Idioma y formato**: Todos los mensajes de interfaz CLI y documentación en español.

## Casos límite

- Entrada vacía o compuesta solo por espacios en blanco en URLs o identificadores.
- URLs con caracteres especiales, parámetros de consulta largos (`?query=...`) o fragmentos (`#hash`).
- Inexistencia inicial del archivo/fuente de almacenamiento local (debe inicializarse automáticamente).
- Archivo de almacenamiento corrupto o inaccesible (debe reportar error comprensible sin romper la ejecución de forma abrupta).
- Fallo al invocar el navegador del sistema operativo (debe capturar el error y mostrar advertencia con la URL resuelta).

## Fuera de alcance

- Servidor HTTP local o demonio en segundo plano (toda la interacción es por comandos CLI).
- Interfaz gráfica (GUI) o interfaz web.
- Soporte para alias personalizados (los identificadores son siempre autogenerados).
- Integración con librerías nativas de portapapeles del sistema operativo (la copia se realiza desde `stdout`).
- Estadísticas analíticas de uso, seguimiento de clics o métricas de acceso.
- Sincronización multiusuario o en red.

## Criterios de finalización

- Todos los requisitos funcionales (RF-1 a RF-12) implementados y respaldados por tests automatizados en verde.
- Suite de pruebas automatizadas (unitarias e integración) ejecutada con 100% de éxito.
- Demostración manual completa del ciclo de vida en terminal: acortar URL -> abrir por identificador -> listar registros -> eliminar registro.

## Dudas abiertas

- Ninguna (especificación acordada y cerrada tras la entrevista de requisitos).
