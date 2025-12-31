import * as path from 'node:path';

import { DataStore } from '@waha/core/abc/DataStore';
import { GowsAuthSimple } from '@waha/core/engines/gows/store/GowsAuthSimple';
import { LocalStore } from '@waha/core/storage/LocalStore';

import { GowsAuth } from './GowsAuth';

export class GowsAuthFactoryCore {
  buildAuth(store: DataStore, name: string): Promise<GowsAuth> {
    if (store instanceof LocalStore) return this.buildSqlite3(store, name);
    throw new Error(`Unsupported store type '${store.constructor.name}'`);
  }

  protected async buildSqlite3(
    store: LocalStore,
    name: string,
  ): Promise<GowsAuth> {
    await store.init(name);
    const authFolder = store.getSessionDirectory(name);
    // resolve path
    const authFolderFullPath = path.resolve(authFolder);
    const connection = `file:${authFolderFullPath}/gows.db`;
    return new GowsAuthSimple(connection, 'sqlite3');
  }
}
