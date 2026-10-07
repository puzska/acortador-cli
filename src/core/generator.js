import { randomInt } from 'node:crypto';

/**
 * Caracteres alfanuméricos base62 para los identificadores cortos.
 */
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ID_LENGTH = 6;

/**
 * Genera un código aleatorio de 6 caracteres alfanuméricos.
 * @returns {string} Identificador de 6 caracteres.
 */
function createRawId() {
  let result = '';
  for (let i = 0; i < ID_LENGTH; i++) {
    result += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return result;
}

/**
 * Genera un identificador único verificando que no colisione con existentes.
 * Cubre RF-1 y RF-5.
 * 
 * @param {(id: string) => boolean} [existsFn=() => false] - Función que comprueba si el ID ya existe.
 * @param {number} [maxAttempts=100] - Número máximo de reintentos ante colisiones.
 * @returns {string} Identificador alfanumérico único de 6 caracteres.
 * @throws {Error} Si se supera el límite de intentos sin encontrar un ID libre.
 */
export function generateShortId(existsFn = () => false, maxAttempts = 100) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const candidate = createRawId();
    if (!existsFn(candidate)) {
      return candidate;
    }
  }

  throw new Error(`No se pudo generar un identificador único tras ${maxAttempts} intentos.`);
}
