import test from 'node:test';
import assert from 'node:assert/strict';
import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runCli } from '../src/cli/index.js';
import { LinkStore } from '../src/storage/store.js';

function createTestContext() {
  const filePath = join(tmpdir(), `acortador_cli_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.json`);
  const store = new LinkStore(filePath);
  const stdoutBuffer = [];
  const stderrBuffer = [];
  const openedUrls = [];

  const io = {
    store,
    stdout: (msg) => stdoutBuffer.push(msg),
    stderr: (msg) => stderrBuffer.push(msg),
    openUrlFn: (url) => openedUrls.push(url)
  };

  const cleanup = () => {
    if (existsSync(filePath)) rmSync(filePath);
  };

  return { io, stdoutBuffer, stderrBuffer, openedUrls, cleanup, store };
}

test('cli - comando acortar: éxito y autocompletado https:// (RF-1, RF-2)', () => {
  const ctx = createTestContext();
  try {
    const code = runCli(['acortar', 'midominio.com/ruta'], ctx.io);
    assert.equal(code, 0);
    assert.equal(ctx.stderrBuffer.length, 0);
    assert.equal(ctx.stdoutBuffer.length, 1);
    assert.match(ctx.stdoutBuffer[0], /Identificador: [a-zA-Z0-9]{6}/);

    const all = ctx.store.getAll();
    assert.equal(all.length, 1);
    assert.equal(all[0].url, 'https://midominio.com/ruta');
  } finally {
    ctx.cleanup();
  }
});

test('cli - comando acortar: idempotencia ante URL repetida (RF-3)', () => {
  const ctx = createTestContext();
  try {
    runCli(['acortar', 'https://example.com/test'], ctx.io);
    const primerId = ctx.store.getAll()[0].id;

    ctx.stdoutBuffer.length = 0;
    const code = runCli(['acortar', 'https://example.com/test'], ctx.io);

    assert.equal(code, 0);
    assert.match(ctx.stdoutBuffer[0], new RegExp(`Identificador: ${primerId}`));
    assert.equal(ctx.store.getAll().length, 1);
  } finally {
    ctx.cleanup();
  }
});

test('cli - comando acortar: error con URL inválida o ausente (RF-4)', () => {
  const ctx = createTestContext();
  try {
    const codeInvalida = runCli(['acortar', 'ftp://no-valido.org'], ctx.io);
    assert.equal(codeInvalida, 1);
    assert.match(ctx.stderrBuffer[0], /Error:/);

    ctx.stderrBuffer.length = 0;
    const codeVacia = runCli(['acortar'], ctx.io);
    assert.equal(codeVacia, 1);
    assert.match(ctx.stderrBuffer[0], /Debes especificar la URL/);
  } finally {
    ctx.cleanup();
  }
});

test('cli - comando abrir: abre URL en navegador (RF-6)', () => {
  const ctx = createTestContext();
  try {
    const link = ctx.store.save('https://example.com/destino');
    const code = runCli(['abrir', link.id], ctx.io);

    assert.equal(code, 0);
    assert.deepEqual(ctx.openedUrls, ['https://example.com/destino']);
    assert.match(ctx.stdoutBuffer[0], /Abriendo/);
  } finally {
    ctx.cleanup();
  }
});

test('cli - comando abrir: error con identificador inexistente o ausente (RF-7)', () => {
  const ctx = createTestContext();
  try {
    const codeNoExiste = runCli(['abrir', 'no_exi'], ctx.io);
    assert.equal(codeNoExiste, 1);
    assert.match(ctx.stderrBuffer[0], /no encontrado/);

    ctx.stderrBuffer.length = 0;
    const codeSinArg = runCli(['abrir'], ctx.io);
    assert.equal(codeSinArg, 1);
    assert.match(ctx.stderrBuffer[0], /Debes especificar el identificador/);
  } finally {
    ctx.cleanup();
  }
});

test('cli - comando listar: muestra registros o mensaje de vacío (RF-8, RF-9)', () => {
  const ctx = createTestContext();
  try {
    // Vacío (RF-9)
    const codeVacio = runCli(['listar'], ctx.io);
    assert.equal(codeVacio, 0);
    assert.match(ctx.stdoutBuffer[0], /No hay enlaces guardados/);

    // Con elementos (RF-8)
    ctx.stdoutBuffer.length = 0;
    ctx.store.save('https://example.com/link1');
    ctx.store.save('https://example.com/link2');

    const codeLleno = runCli(['listar'], ctx.io);
    assert.equal(codeLleno, 0);
    assert.match(ctx.stdoutBuffer[0], /https:\/\/example.com\/link1/);
    assert.match(ctx.stdoutBuffer[0], /https:\/\/example.com\/link2/);
  } finally {
    ctx.cleanup();
  }
});

test('cli - comando eliminar: éxito y error en inexistente (RF-10, RF-11)', () => {
  const ctx = createTestContext();
  try {
    const link = ctx.store.save('https://example.com/eliminar');

    // Éxito (RF-10)
    const codeOk = runCli(['eliminar', link.id], ctx.io);
    assert.equal(codeOk, 0);
    assert.match(ctx.stdoutBuffer[0], /eliminado correctamente/);
    assert.equal(ctx.store.getById(link.id), null);

    // Inexistente (RF-11)
    ctx.stderrBuffer.length = 0;
    const codeInexistente = runCli(['eliminar', link.id], ctx.io);
    assert.equal(codeInexistente, 1);
    assert.match(ctx.stderrBuffer[0], /no encontrado/);
  } finally {
    ctx.cleanup();
  }
});

test('cli - ayuda o comando desconocido', () => {
  const ctx = createTestContext();
  try {
    const codeAyuda = runCli(['--help'], ctx.io);
    assert.equal(codeAyuda, 0);
    assert.match(ctx.stdoutBuffer[0], /Uso: acortador <comando>/);

    ctx.stderrBuffer.length = 0;
    const codeDesconocido = runCli(['comando_raro'], ctx.io);
    assert.equal(codeDesconocido, 1);
    assert.match(ctx.stderrBuffer[0], /Comando desconocido/);
  } finally {
    ctx.cleanup();
  }
});

test('cli - ejecución real del binario bin/acortador.js vía subproceso', async () => {
  const { execFileSync } = await import('node:child_process');
  const binPath = join(process.cwd(), 'bin', 'acortador.js');

  const output = execFileSync(process.execPath, [binPath, '--help'], { encoding: 'utf-8' });
  assert.match(output, /Acortador de URLs Local/);
});
