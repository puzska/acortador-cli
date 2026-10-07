import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { generateShortId } from '../core/generator.js';

/**
 * Gestor de persistencia local en disco para enlaces acortados.
 * Cubre RF-1, RF-3, RF-5, RF-8, RF-9, RF-10, RF-11 y RF-12.
 */
export class LinkStore {
  /**
   * @param {string} [filePath] - Ruta al archivo JSON de persistencia local.
   */
  constructor(filePath = resolve(process.cwd(), 'links.json')) {
    this.filePath = filePath;
    this._init();
  }

  /**
   * Inicializa el archivo si no existe o valida su formato.
   * @private
   */
  _init() {
    const dir = dirname(this.filePath);
    if (dir && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    if (!existsSync(this.filePath)) {
      const initialData = { links: {} };
      writeFileSync(this.filePath, JSON.stringify(initialData, null, 2), 'utf-8');
    } else {
      // Validar que el archivo sea JSON legible
      this._readData();
    }
  }

  /**
   * Lee y analiza el contenido del almacenamiento.
   * @private
   * @returns {{ links: Record<string, { id: string, url: string, createdAt: string }> }}
   */
  _readData() {
    try {
      const raw = readFileSync(this.filePath, 'utf-8');
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || !data.links) {
        throw new Error('Formato inválido');
      }
      return data;
    } catch {
      throw new Error(`El archivo de almacenamiento local está corrupto o tiene formato no válido: ${this.filePath}`);
    }
  }

  /**
   * Guarda los datos en disco de forma atómica/síncrona.
   * @private
   * @param {object} data
   */
  _writeData(data) {
    writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Guarda una URL en el almacenamiento con soporte de idempotencia (RF-3).
   * @param {string} url - URL válida y normalizada.
   * @returns {{ id: string, url: string, createdAt: string }}
   */
  save(url) {
    const data = this._readData();

    // Idempotencia (RF-3): Si la URL ya existe, devolver el registro previo
    const existing = Object.values(data.links).find((item) => item.url === url);
    if (existing) {
      return existing;
    }

    // Generar identificador único sin colisiones (RF-1, RF-5)
    const id = generateShortId((candidate) => Boolean(data.links[candidate]));

    const newLink = {
      id,
      url,
      createdAt: new Date().toISOString()
    };

    data.links[id] = newLink;
    this._writeData(data);

    return newLink;
  }

  /**
   * Busca un enlace por su identificador.
   * @param {string} id
   * @returns {{ id: string, url: string, createdAt: string } | null}
   */
  getById(id) {
    const data = this._readData();
    return data.links[id] || null;
  }

  /**
   * Retorna todos los enlaces registrados.
   * @returns {Array<{ id: string, url: string, createdAt: string }>}
   */
  getAll() {
    const data = this._readData();
    return Object.values(data.links);
  }

  /**
   * Elimina un enlace por su identificador.
   * @param {string} id
   * @returns {boolean} true si fue eliminado, false si no existía.
   */
  deleteById(id) {
    const data = this._readData();
    if (!data.links[id]) {
      return false;
    }

    delete data.links[id];
    this._writeData(data);
    return true;
  }
}
