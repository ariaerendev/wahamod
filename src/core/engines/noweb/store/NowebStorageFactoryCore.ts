import { LocalStore } from '@waha/core/storage/LocalStore';

import { DataStore } from '../../../abc/DataStore';
import { INowebStorage } from './INowebStorage';
import { Sqlite3Storage } from './sqlite3/Sqlite3Storage';

export class NowebStorageFactoryCore {
  createStorage(store: DataStore, name: string): INowebStorage {
    if (store instanceof LocalStore) {
      return this.buildStorageSqlite3(store, name);
    }
    throw new Error(`Unsupported store type '${store.constructor.name}'`);
  }

  private buildStorageSqlite3(store: LocalStore, name: string) {
    const filePath = store.getFilePath(name, 'store.sqlite3');
    return new Sqlite3Storage(filePath);
  }
}
