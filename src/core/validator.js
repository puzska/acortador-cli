/**
 * Módulo de validación y normalización de URLs.
 * Cubre RF-2 (autocompletar https://) y RF-4 (validación estricta y rechazo de errores).
 */

const SUPPORTED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Valida y normaliza una URL ingresada por el usuario.
 * @param {string} input - URL en texto plano.
 * @returns {string} URL normalizada y válida con esquema http:// o https://.
 * @throws {Error} Si la URL está vacía, tiene esquema no soportado o formato inválido.
 */
export function validateAndNormalizeUrl(input) {
  if (typeof input !== 'string' || input.trim() === '') {
    throw new Error('La URL no puede estar vacía.');
  }

  let candidate = input.trim();

  // Si no incluye un esquema (ej. 'ejemplo.com' o '//ejemplo.com'), autocompletar con https:// (RF-2)
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(candidate)) {
    // Si contiene otro esquema como mailto: o file:, capturarlo
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(candidate)) {
      throw new Error('Esquema de protocolo no soportado. Solo se admiten http y https.');
    }
    candidate = `https://${candidate}`;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(candidate);
  } catch {
    throw new Error('URL inválida.');
  }

  if (!SUPPORTED_PROTOCOLS.has(parsedUrl.protocol)) {
    throw new Error(`Esquema de protocolo no soportado (${parsedUrl.protocol}). Solo se admiten http y https.`);
  }

  if (!parsedUrl.hostname || parsedUrl.hostname.trim() === '') {
    throw new Error('URL inválida: nombre de host ausente o incorrecto.');
  }

  return parsedUrl.href;
}
