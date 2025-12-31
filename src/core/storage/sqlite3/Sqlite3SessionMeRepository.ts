import { Sqlite3SchemaValidation } from '@waha/core/engines/noweb/store/sqlite3/Sqlite3SchemaValidation';
import { ISessionMeRepository } from '@waha/core/storage/ISessionMeRepository';
import { LocalStore } from '@waha/core/storage/LocalStore';
import { SQLMeMigrations, SQLMeSchema } from '@waha/core/storage/sql/schemas';
import { Sqlite3KVRepository } from '@waha/core/storage/sqlite3/Sqlite3KVRepository';
import { MeInfo } from '@waha/structures/sessions.dto';

class SessionMeInfo {
  id: string;
  me?: MeInfo;
}

export class Sqlite3SessionMeRepository
  extends Sqlite3KVRepository<SessionMeInfo>
  implements ISessionMeRepository
{
  get schema() {
    return SQLMeSchema;
  }

  get migrations() {
    return SQLMeMigrations;
  }

  constructor(store: LocalStore) {
    const knex = store.getWAHADatabase();
    super(knex);
  }

  upsertMe(sessionName: string, me: MeInfo): Promise<void> {
    return this.upsertOne({ id: sessionName, me: me });
  }

  async getMe(sessionName: string): Promise<MeInfo | null> {
    const data = await this.getById(sessionName);
    return data?.me;
  }

  removeMe(sessionName: string): Promise<void> {
    return this.deleteById(sessionName);
  }

  protected async validateSchema() {
    const validation = new Sqlite3SchemaValidation(this.schema, this.knex);
    await validation.validate();
  }
}
