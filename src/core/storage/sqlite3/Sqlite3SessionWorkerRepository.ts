import { Sqlite3SchemaValidation } from '@waha/core/engines/noweb/store/sqlite3/Sqlite3SchemaValidation';
import {
  ISessionWorkerRepository,
  SessionWorkerInfo,
} from '@waha/core/storage/ISessionWorkerRepository';
import { LocalStore } from '@waha/core/storage/LocalStore';
import {
  SQLSessionWorkerMigrations,
  SQLSessionWorkerSchema,
} from '@waha/core/storage/sql/schemas';
import { Sqlite3KVRepository } from '@waha/core/storage/sqlite3/Sqlite3KVRepository';

export class Sqlite3SessionWorkerRepository
  extends Sqlite3KVRepository<SessionWorkerInfo>
  implements ISessionWorkerRepository
{
  get schema() {
    return SQLSessionWorkerSchema;
  }

  get migrations() {
    return SQLSessionWorkerMigrations;
  }

  constructor(store: LocalStore) {
    const knex = store.getWAHADatabase();
    super(knex);
  }

  assign(session: string, worker: string): Promise<void> {
    return this.upsertOne({ id: session, worker: worker });
  }

  unassign(session: string, worker: string): Promise<void> {
    return this.deleteBy({ id: session, worker: worker });
  }

  remove(session: string) {
    return this.deleteById(session);
  }

  async getSessionsByWorker(worker: string): Promise<string[]> {
    const data = await this.getAllBy({ worker: worker });
    return data.map((d) => d.id);
  }

  protected async validateSchema() {
    const validation = new Sqlite3SchemaValidation(this.schema, this.knex);
    await validation.validate();
  }
}
