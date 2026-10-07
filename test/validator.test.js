import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAndNormalizeUrl } from '../src/core/validator.js';

test('validador - URLs válidas con esquema http o https', () => {
  const urlHttps = validateAndNormalizeUrl('https://example.com/test?query=1#hash');
  assert.equal(urlHttps, 'https://example.com/test?query=1#hash');

  const urlHttp = validateAndNormalizeUrl('http://sub.dominio.org:8080/path');
  assert.equal(urlHttp, 'http://sub.dominio.org:8080/path');
});

test('validador - RF-2 autocompleta con https:// si falta el protocolo', () => {
  const normalized = validateAndNormalizeUrl('google.com');
  assert.equal(normalized, 'https://google.com/');

  const normalizedWithPath = validateAndNormalizeUrl('mi-sitio.com/recurso?ref=local');
  assert.equal(normalizedWithPath, 'https://mi-sitio.com/recurso?ref=local');
});

test('validador - RF-4 rechaza esquemas no soportados', () => {
  assert.throws(
    () => validateAndNormalizeUrl('ftp://servidor.com/archivo.zip'),
    /Esquema de protocolo no soportado/
  );

  assert.throws(
    () => validateAndNormalizeUrl('file:///C:/archivo.txt'),
    /Esquema de protocolo no soportado/
  );

  assert.throws(
    () => validateAndNormalizeUrl('mailto:test@example.com'),
    /Esquema de protocolo no soportado/
  );
});

test('validador - RF-4 rechaza entradas vacías o sintaxis inválida', () => {
  assert.throws(
    () => validateAndNormalizeUrl(''),
    /La URL no puede estar vacía/
  );

  assert.throws(
    () => validateAndNormalizeUrl('   '),
    /La URL no puede estar vacía/
  );

  assert.throws(
    () => validateAndNormalizeUrl(null),
    /La URL no puede estar vacía/
  );

  assert.throws(
    () => validateAndNormalizeUrl('https://'),
    /URL inválida/
  );

  assert.throws(
    () => validateAndNormalizeUrl('no es una url ni tiene formato valido :::'),
    /URL inválida/
  );
});
