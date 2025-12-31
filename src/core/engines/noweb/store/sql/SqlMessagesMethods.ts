import { ALL_JID } from '@waha/core/engines/noweb/session.noweb.core';
import { SqlKVRepository } from '@waha/core/storage/sql/SqlKVRepository';
import { AckToStatus } from '@waha/core/utils/acks';
import { GetChatMessagesFilter } from '@waha/structures/chats.dto';
import { PaginationParams } from '@waha/structures/pagination.dto';

export class SqlMessagesMethods {
  constructor(private repository: SqlKVRepository<any>) {}

  upsert(messages: any[]): Promise<void> {
    return this.repository.upsertMany(messages);
  }

  async getAllByJid(
    jid: string,
    filter: GetChatMessagesFilter,
    pagination: PaginationParams,
  ): Promise<any[]> {
    let query = this.repository.select();
    if (jid !== ALL_JID) {
      query = this.repository.select().where({ jid: jid });
    }
    if (filter['filter.timestamp.lte'] != null) {
      query = query.where(
        'messageTimestamp',
        '<=',
        filter['filter.timestamp.lte'],
      );
    }
    if (filter['filter.timestamp.gte'] != null) {
      query = query.where(
        'messageTimestamp',
        '>=',
        filter['filter.timestamp.gte'],
      );
    }
    if (filter['filter.fromMe'] != null) {
      // filter by data json inside
      const [sql, value] = this.repository.filterJson(
        'data',
        'key.fromMe',
        filter['filter.fromMe'],
      );
      query = query.whereRaw(sql, [value]);
    }
    if (filter['filter.ack'] != null) {
      const status = AckToStatus(filter['filter.ack']);
      const [sql, value] = this.repository.filterJson('data', 'status', status);
      query = query.whereRaw(sql, [value]);
    }
    query = this.repository.pagination(query, pagination);
    return this.repository.all(query);
  }

  async getByJidById(jid: string, id: string): Promise<any> {
    if (jid === ALL_JID) {
      return this.repository.getBy({ id: id });
    }
    return this.repository.getBy({ jid: jid, id: id });
  }

  async updateByJidAndId(
    jid: string,
    id: string,
    update: any,
  ): Promise<boolean> {
    const entity = await this.getByJidById(jid, id);
    if (!entity) {
      return false;
    }
    Object.assign(entity, update);
    await this.repository.upsertOne(entity);
  }

  async deleteByJidByIds(jid: string, ids: string[]): Promise<void> {
    const query = `DELETE
                   FROM "${this.repository.table}"
                   WHERE jid = ?
                     AND id IN (${ids.map(() => '?').join(', ')})`;
    await this.repository.raw(query, [jid, ...ids]);
  }

  deleteAllByJid(jid: string): Promise<void> {
    return this.repository.deleteBy({ jid: jid });
  }
}
