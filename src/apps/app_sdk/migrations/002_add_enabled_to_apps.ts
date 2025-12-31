import { Knex } from 'knex';

exports.up = async function (knex: Knex) {
  // Add a boolean column 'enabled' defaulting to true and not nullable.
  const hasColumn = await knex.schema.hasColumn('apps', 'enabled');
  if (!hasColumn) {
    await knex.schema.alterTable('apps', (table) => {
      table.boolean('enabled').defaultTo(true);
    });
    // Ensure existing rows have enabled=true
    await knex('apps').update({ enabled: true });
    // Make the column NOT NULL
    await knex.schema.alterTable('apps', (table) => {
      table.boolean('enabled').notNullable().defaultTo(true).alter();
    });
  }
};

exports.down = async function (knex: Knex) {
  const hasColumn = await knex.schema.hasColumn('apps', 'enabled');
  if (hasColumn) {
    await knex.schema.alterTable('apps', (table) => {
      table.dropColumn('enabled');
    });
  }
};
