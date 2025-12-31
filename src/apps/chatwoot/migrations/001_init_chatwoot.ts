import { Knex } from 'knex';

exports.up = function (knex: Knex) {
  return (
    knex.schema
      // ChatWoot Messages
      .createTable('app_chatwoot_chatwoot_messages', function (table) {
        table.increments('id');
        table.integer('app_pk');
        table
          .foreign('app_pk')
          .references('pk')
          .inTable('apps')
          .onDelete('CASCADE');
        table.datetime('timestamp');
        table.integer('conversation_id');
        table.integer('message_id');
      })
      .table('app_chatwoot_chatwoot_messages', function (table) {
        table.unique(['id'], { indexName: 'cwt_msg_id_unique' });
        table.unique(['app_pk', 'conversation_id', 'message_id'], {
          indexName: 'cwt_msg_app_conv_msg_unique',
        });
        table.index(['app_pk'], 'cwt_msg_app_idx');
        table.index(['app_pk', 'conversation_id'], 'cwt_msg_app_conv_idx');
        table.index(
          ['app_pk', 'conversation_id', 'message_id'],
          'cwt_msg_app_conv_msg_idx',
        );
        table.index(['app_pk', 'timestamp'], 'cwt_msg_app_ts_idx');
      })
      // WhatsApp Messages
      .createTable('app_chatwoot_whatsapp_messages', function (table) {
        table.increments('id');
        table.integer('app_pk');
        table
          .foreign('app_pk')
          .references('pk')
          .inTable('apps')
          .onDelete('CASCADE');
        table.string('chat_id', 64);
        table.string('message_id', 64);
        table.boolean('from_me');
        table.string('participant', 64).nullable();
        table.datetime('timestamp');
      })
      .table('app_chatwoot_whatsapp_messages', function (table) {
        table.unique(['id'], { indexName: 'wa_msg_id_unique' });
        table.unique(['app_pk', 'chat_id', 'message_id'], {
          indexName: 'wa_msg_app_chat_msg_unique',
        });
        table.index(['app_pk'], 'wa_msg_app_idx');
        table.index(['app_pk', 'chat_id'], 'wa_msg_app_chat_idx');
        table.index(['app_pk', 'message_id'], 'wa_msg_app_msg_idx');
        table.index(
          ['app_pk', 'chat_id', 'timestamp'],
          'wa_msg_app_chat_ts_idx',
        );
        table.index(['app_pk', 'timestamp'], 'wa_msg_app_ts_idx');
      })

      // Message Mapping (Chatwoot <-> WhatsApp)
      .createTable('app_chatwoot_message_mappings', function (table) {
        table.increments('id');
        table.integer('app_pk');
        table
          .foreign('app_pk')
          .references('pk')
          .inTable('apps')
          .onDelete('CASCADE');
        table.integer('chatwoot_message_id');
        table
          .foreign('chatwoot_message_id')
          .references('id')
          .inTable('app_chatwoot_chatwoot_messages')
          .onDelete('CASCADE');
        table.integer('whatsapp_message_id');
        table
          .foreign('whatsapp_message_id')
          .references('id')
          .inTable('app_chatwoot_whatsapp_messages')
          .onDelete('CASCADE');
        table.integer('part');
      })
      .table('app_chatwoot_message_mappings', function (table) {
        table.unique(['id'], { indexName: 'map_id_unique' });
        table.unique(
          ['app_pk', 'chatwoot_message_id', 'whatsapp_message_id', 'part'],
          { indexName: 'map_app_cwt_wa_part_unique' },
        );
        table.index(['app_pk'], 'map_app_idx');
        table.index(['app_pk', 'chatwoot_message_id'], 'map_app_cwt_idx');
        table.index(['app_pk', 'whatsapp_message_id'], 'map_app_wa_idx');
      })
  );
};

exports.down = function (knex: Knex) {
  return knex.schema
    .dropTable('app_chatwoot_chatwoot_messages')
    .dropTable('app_chatwoot_whatsapp_messages')
    .dropTable('app_chatwoot_message_mappings');
};
