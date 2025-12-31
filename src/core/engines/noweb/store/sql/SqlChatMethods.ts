import type { Chat } from '@adiwajshing/baileys';
import { SqlKVRepository } from '@waha/core/storage/sql/SqlKVRepository';
import { OverviewFilter } from '@waha/structures/chats.dto';
import { PaginationParams } from '@waha/structures/pagination.dto';

export class SqlChatMethods {
  constructor(private repository: SqlKVRepository<any>) {}

  async getAllWithMessages(
    pagination: PaginationParams,
    broadcast: boolean,
    filter?: OverviewFilter,
  ): Promise<Chat[]> {
    // Get chats with conversationTimestamp is not Null
    let query = this.repository.select().whereNotNull('conversationTimestamp');

    if (!broadcast) {
      // filter out chat by id if it ends at @newsletter or @broadcast
      query = query
        .andWhereNot('id', 'like', '%@broadcast')
        .andWhereNot('id', 'like', '%@newsletter');
    }

    // Filter by IDs if provided
    if (filter?.ids && filter.ids.length > 0) {
      query = query.whereIn('id', filter.ids);
    }

    query = this.repository.pagination(query, pagination);
    return await this.repository.all(query);
  }
}
