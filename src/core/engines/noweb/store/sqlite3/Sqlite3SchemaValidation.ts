import { Schema } from '@waha/core/storage/Schema';
import Knex from 'knex';

export class Sqlite3SchemaValidation {
  constructor(
    private table: Schema,
    private knex: Knex.Knex,
  ) {}

  async validate() {
    const table = this.table;

    // Check table has the columns
    const columns = await this.knex.raw(`PRAGMA table_info(${table.name})`);
    // Check the exact number of columns
    if (columns.length !== table.columns.length) {
      throw new Error(
        `Table '${table.name}' does not have expected number of columns. Expected ${table.columns.length}, got ${columns.length}`,
      );
    }

    // Check column + type
    for (const column of table.columns) {
      const columnInfo = columns.find((c) => c.name === column.fieldName);
      if (!columnInfo) {
        throw new Error(
          `Table '${table.name}' does not have column '${column.fieldName}'`,
        );
      }
      if (columnInfo.type !== column.type) {
        throw new Error(
          `Table '${table.name}' column '${column.fieldName}' has type '${columnInfo.type}' but expected '${column.type}'`,
        );
      }
    }

    // Check table has expected indexes
    const indexes = await this.knex.raw(`PRAGMA index_list(${table.name})`);
    const indexNames = indexes.map((index) => index.name);
    for (const index of table.indexes) {
      if (!indexNames.includes(index.name)) {
        throw new Error(
          `Table '${table.name}' does not have index '${index.name}'`,
        );
      }
    }
  }
}
