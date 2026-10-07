import { validateAndNormalizeUrl } from '../core/validator.js';
import { LinkStore } from '../storage/store.js';
import { openUrlInBrowser } from '../platform/launcher.js';

/**
 * Muestra el texto de ayuda del CLI.
 * @returns {string}
 */
function getHelpText() {
  return `Acortador de URLs Local (CLI)

Uso: acortador <comando> [argumentos]

Comandos disponibles:
  acortar <url>      Acorta una URL y genera un identificador local único.
  abrir <id>         Abre la URL original en el navegador predeterminado.
  listar             Muestra todos los enlaces acortados guardados.
  eliminar <id>      Elimina un enlace guardado del almacenamiento local.
  ayuda, --help      Muestra esta ayuda.
`;
}

/**
 * Despachador de comandos CLI.
 * Cubre RF-1 a RF-12.
 * 
 * @param {string[]} args - Argumentos de consola (excluyendo node y script).
 * @param {object} [io={}] - Canales de entrada/salida y dependencias inyectables.
 * @param {(msg: string) => void} [io.stdout] - Salida estándar.
 * @param {(msg: string) => void} [io.stderr] - Salida de errores.
 * @param {LinkStore} [io.store] - Instancia de almacenamiento local.
 * @param {(url: string) => void} [io.openUrlFn] - Función para abrir navegador.
 * @returns {number} Código de salida (0 para éxito, 1 para error).
 */
export function runCli(args = [], io = {}) {
  const stdout = io.stdout || ((msg) => console.log(msg));
  const stderr = io.stderr || ((msg) => console.error(msg));
  const store = io.store || new LinkStore();
  const openUrlFn = io.openUrlFn || ((url) => openUrlInBrowser(url));

  const [command, param] = args;

  if (!command || command === '--help' || command === '-h' || command === 'ayuda') {
    stdout(getHelpText());
    return 0;
  }

  try {
    switch (command) {
      case 'acortar': {
        if (!param || param.trim() === '') {
          stderr('Error: Debes especificar la URL a acortar. Ejemplo: acortador acortar https://mi-sitio.com');
          return 1;
        }

        const normalizedUrl = validateAndNormalizeUrl(param);
        const link = store.save(normalizedUrl);

        stdout(`Identificador: ${link.id}\nURL: ${link.url}\nComando para abrir: acortador abrir ${link.id}`);
        return 0;
      }

      case 'abrir': {
        if (!param || param.trim() === '') {
          stderr('Error: Debes especificar el identificador a abrir. Ejemplo: acortador abrir x8k2m9');
          return 1;
        }

        const link = store.getById(param.trim());
        if (!link) {
          stderr(`Error: Identificador "${param.trim()}" no encontrado.`);
          return 1;
        }

        stdout(`Abriendo ${link.url} en tu navegador predeterminado...`);
        openUrlFn(link.url);
        return 0;
      }

      case 'listar': {
        const links = store.getAll();
        if (links.length === 0) {
          stdout('No hay enlaces guardados actualmente.');
          return 0;
        }

        const lineas = links.map((item) => `- [${item.id}] -> ${item.url} (${item.createdAt})`);
        stdout(`Enlaces guardados (${links.length}):\n${lineas.join('\n')}`);
        return 0;
      }

      case 'eliminar': {
        if (!param || param.trim() === '') {
          stderr('Error: Debes especificar el identificador a eliminar. Ejemplo: acortador eliminar x8k2m9');
          return 1;
        }

        const id = param.trim();
        const eliminado = store.deleteById(id);
        if (!eliminado) {
          stderr(`Error: Identificador "${id}" no encontrado.`);
          return 1;
        }

        stdout(`Enlace "${id}" eliminado correctamente.`);
        return 0;
      }

      default: {
        stderr(`Error: Comando desconocido "${command}". Usa --help para ver los comandos disponibles.`);
        return 1;
      }
    }
  } catch (error) {
    stderr(`Error: ${error.message}`);
    return 1;
  }
}
