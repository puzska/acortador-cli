import { execSync } from 'node:child_process';

/**
 * Obtiene el comando nativo del sistema operativo para abrir una URL en el navegador.
 * @param {string} url - URL válida a abrir.
 * @param {string} [platform=process.platform] - Identificador de plataforma ('win32', 'darwin', 'linux').
 * @returns {string} Comando del sistema operativo.
 */
export function getBrowserCommand(url, platform = process.platform) {
  // Asegurar escape básico de comillas dobles en la URL si existieran
  const sanitizedUrl = url.replace(/"/g, '%22');

  switch (platform) {
    case 'win32':
      // En Windows, start requiere el primer argumento entre comillas como título de ventana
      return `start "" "${sanitizedUrl}"`;
    case 'darwin':
      return `open "${sanitizedUrl}"`;
    case 'linux':
    default:
      return `xdg-open "${sanitizedUrl}"`;
  }
}

/**
 * Abre una URL en el navegador predeterminado del sistema operativo.
 * Cubre RF-6.
 * 
 * @param {string} url - URL a abrir.
 * @param {object} [options={}] - Opciones configurables para testing o inyección.
 * @param {(cmd: string) => void} [options.execFn] - Función de ejecución.
 * @param {string} [options.platform] - Plataforma del sistema operativo.
 */
export function openUrlInBrowser(url, options = {}) {
  const platform = options.platform || process.platform;
  const execFn = options.execFn || ((cmd) => execSync(cmd, { stdio: 'ignore' }));

  const command = getBrowserCommand(url, platform);

  try {
    execFn(command);
  } catch (error) {
    throw new Error(`No se pudo abrir el navegador predeterminado para la URL ${url}: ${error.message}`);
  }
}
