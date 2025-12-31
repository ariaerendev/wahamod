import type { Label } from '@adiwajshing/baileys/lib/Types/Label';
import { ILabelsRepository } from '@waha/core/engines/noweb/store/ILabelsRepository';
import { NowebLabelsSchema } from '@waha/core/engines/noweb/store/schemas';

import { NOWEBSqlite3KVRepository } from './NOWEBSqlite3KVRepository';

export class Sqlite3LabelsRepository
  extends NOWEBSqlite3KVRepository<Label>
  implements ILabelsRepository
{
  get schema() {
    return NowebLabelsSchema;
  }
}
