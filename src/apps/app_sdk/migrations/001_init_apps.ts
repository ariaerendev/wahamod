import { Knex } from 'knex';

exports.up = function (knex: Knex) {
  return knex.schema
    .createTable('apps', function (table) {
      table.increments('pk');
      table.string('id', 64);
      table.string('session', 64);
      table.string('app', 64);
      table.json('config');
    })
    .table('apps', function (table) {
      table.unique(['pk']);
      table.index(['session']);
      table.index(['id']);
      table.unique(['id']);
    });
};

exports.down = function (knex: Knex) {
  return knex.schema.dropTable('apps');
};
