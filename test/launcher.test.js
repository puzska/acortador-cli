import test from 'node:test';
import assert from 'node:assert/strict';
import { getBrowserCommand, openUrlInBrowser } from '../src/platform/launcher.js';

test('launcher - comando adecuado según sistema operativo (RF-6)', () => {
  const url = 'https://example.com/dest?param=1';

  const cmdWin = getBrowserCommand(url, 'win32');
  assert.equal(cmdWin, 'start "" "https://example.com/dest?param=1"');

  const cmdMac = getBrowserCommand(url, 'darwin');
  assert.equal(cmdMac, 'open "https://example.com/dest?param=1"');

  const cmdLinux = getBrowserCommand(url, 'linux');
  assert.equal(cmdLinux, 'xdg-open "https://example.com/dest?param=1"');
});

test('launcher - ejecución con ejecutor inyectado para tests', () => {
  const url = 'https://example.com/test';
  let comandoEjecutado = '';

  const mockExec = (command) => {
    comandoEjecutado = command;
  };

  openUrlInBrowser(url, { execFn: mockExec, platform: 'win32' });
  assert.equal(comandoEjecutado, 'start "" "https://example.com/test"');
});

test('launcher - propaga error descriptivo si falla el comando del sistema', () => {
  const url = 'https://example.com/test';
  const failingExec = () => {
    throw new Error('Comando no encontrado en el sistema');
  };

  assert.throws(
    () => openUrlInBrowser(url, { execFn: failingExec, platform: 'linux' }),
    /No se pudo abrir el navegador predeterminado/
  );
});
