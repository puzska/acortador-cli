import test from 'node:test';
import assert from 'node:assert/strict';
import { generateShortId } from '../src/core/generator.js';

test('generador - RF-1 genera identificador de longitud 6 y alfanumérico', () => {
  const id = generateShortId();
  assert.equal(typeof id, 'string');
  assert.equal(id.length, 6);
  assert.match(id, /^[a-zA-Z0-9]{6}$/);
});

test('generador - genera identificadores diversos en ejecuciones consecutivas', () => {
  const ids = new Set();
  for (let i = 0; i < 50; i++) {
    ids.add(generateShortId());
  }
  // No debería haber colisiones en un muestreo pequeño de 50 elementos
  assert.equal(ids.size, 50);
});

test('generador - RF-5 resuelve colisiones reintentando hasta hallar un ID disponible', () => {
  let intentos = 0;
  // Simular que los primeros 2 IDs colisionan (ya existen)
  const existsMock = (id) => {
    intentos++;
    return intentos <= 2;
  };

  const id = generateShortId(existsMock);
  assert.equal(typeof id, 'string');
  assert.equal(id.length, 6);
  assert.equal(intentos, 3); // Intentó 1 (colisión), 2 (colisión), 3 (disponible)
});

test('generador - lanza error si se supera el límite máximo de intentos por colisión', () => {
  // Simular que todos los IDs siempre existen
  const alwaysCollides = () => true;

  assert.throws(
    () => generateShortId(alwaysCollides, 10),
    /No se pudo generar un identificador único tras 10 intentos/
  );
});
