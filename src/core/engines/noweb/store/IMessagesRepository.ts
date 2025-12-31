import { GetChatMessagesFilter } from '@waha/structures/chats.dto';
import { PaginationParams } from '@waha/structures/pagination.dto';

export interface IMessagesRepository {
  deleteAll(): Promise<void>;

  upsert(messages: any[]): Promise<void>;

  upsertOne(message: any): Promise<void>;

  getById(id: string): Promise<any | null>;

  getAllByJid(
    jid: string,
    filter: GetChatMessagesFilter,
    pagination: PaginationParams,
  ): Promise<any[]>;

  getByJidById(jid: string, id: string): Promise<any | null>;

  updateByJidAndId(jid: string, id: string, update: any): Promise<boolean>;

  deleteByJidByIds(jid: string, ids: string[]): Promise<void>;

  deleteAllByJid(jid: string): Promise<void>;
}
