import test from 'node:test';
import assert from 'node:assert/strict';

test('entorno de pruebas nativo operativo', () => {
  assert.equal(1 + 1, 2);
});
