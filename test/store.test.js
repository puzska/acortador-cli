import test from 'node:test';
import assert from 'node:assert/strict';
import { rmSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LinkStore } from '../src/storage/store.js';

function getTempFilePath(name) {
  return join(tmpdir(), `acortador_test_${name}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.json`);
}

test('store - inicialización automática si el archivo no existe (RF-12)', () => {
  const filePath = getTempFilePath('init');
  try {
    assert.equal(existsSync(filePath), false);
    const store = new LinkStore(filePath);
    const all = store.getAll();
    assert.deepEqual(all, []);
    assert.equal(existsSync(filePath), true);
  } finally {
    if (existsSync(filePath)) rmSync(filePath);
  }
});

test('store - RF-1 y RF-12 guardado y recuperación de enlaces', () => {
  const filePath = getTempFilePath('save');
  try {
    const store = new LinkStore(filePath);
    const link = store.save('https://example.com/pagina1');

    assert.equal(typeof link.id, 'string');
    assert.equal(link.id.length, 6);
    assert.equal(link.url, 'https://example.com/pagina1');
    assert.ok(link.createdAt);

    const retrieved = store.getById(link.id);
    assert.deepEqual(retrieved, link);
  } finally {
    if (existsSync(filePath)) rmSync(filePath);
  }
});

test('store - RF-3 idempotencia: guardar la misma URL reutiliza el identificador', () => {
  const filePath = getTempFilePath('idempotent');
  try {
    const store = new LinkStore(filePath);
    const primerRegistro = store.save('https://example.com/repetida');
    const segundoRegistro = store.save('https://example.com/repetida');

    assert.equal(segundoRegistro.id, primerRegistro.id);
    assert.equal(segundoRegistro.url, primerRegistro.url);
    assert.equal(segundoRegistro.createdAt, primerRegistro.createdAt);

    // Solo debe haber un registro en disco
    const todos = store.getAll();
    assert.equal(todos.length, 1);
  } finally {
    if (existsSync(filePath)) rmSync(filePath);
  }
});

test('store - RF-8 y RF-9 listado de enlaces guardados y listado vacío', () => {
  const filePath = getTempFilePath('list');
  try {
    const store = new LinkStore(filePath);
    assert.deepEqual(store.getAll(), []); // RF-9: vacío

    store.save('https://example.com/1');
    store.save('https://example.com/2');

    const todos = store.getAll();
    assert.equal(todos.length, 2);
    assert.ok(todos.some((item) => item.url === 'https://example.com/1'));
    assert.ok(todos.some((item) => item.url === 'https://example.com/2'));
  } finally {
    if (existsSync(filePath)) rmSync(filePath);
  }
});

test('store - RF-10 y RF-11 eliminación de enlace existente e inexistente', () => {
  const filePath = getTempFilePath('delete');
  try {
    const store = new LinkStore(filePath);
    const link = store.save('https://example.com/a-borrar');

    // RF-10: Eliminar existente
    const eliminado = store.deleteById(link.id);
    assert.equal(eliminado, true);
    assert.equal(store.getById(link.id), null);
    assert.equal(store.getAll().length, 0);

    // RF-11: Eliminar inexistente
    const eliminadoInexistente = store.deleteById('no_exi');
    assert.equal(eliminadoInexistente, false);
  } finally {
    if (existsSync(filePath)) rmSync(filePath);
  }
});

test('store - RF-12 persistencia verificada entre distintas instancias de store', () => {
  const filePath = getTempFilePath('persist');
  try {
    const store1 = new LinkStore(filePath);
    const link = store1.save('https://example.com/persistencia');

    // Segunda instancia leyendo el mismo archivo
    const store2 = new LinkStore(filePath);
    const retrieved = store2.getById(link.id);
    assert.deepEqual(retrieved, link);
  } finally {
    if (existsSync(filePath)) rmSync(filePath);
  }
});

test('store - manejo de error descriptivo ante archivo corrupto', () => {
  const filePath = getTempFilePath('corrupt');
  try {
    writeFileSync(filePath, '{ archivo corrupto no json', 'utf-8');
    assert.throws(
      () => new LinkStore(filePath),
      /El archivo de almacenamiento local está corrupto/
    );
  } finally {
    if (existsSync(filePath)) rmSync(filePath);
  }
});
