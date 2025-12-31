import type { LabelAssociation } from '@adiwajshing/baileys/lib/Types/LabelAssociation';
import { SqlKVRepository } from '@waha/core/storage/sql/SqlKVRepository';
import { LabelAssociationType } from '@waha/core/engines/noweb/labels/LabelAssociationType';

export class SqlLabelAssociationsMethods {
  constructor(private repository: SqlKVRepository<any>) {}

  async deleteOne(association: LabelAssociation): Promise<void> {
    await this.repository.deleteBy({
      type: association.type,
      chatId: association.chatId,
      labelId: association.labelId,
      // @ts-ignore: messageId doesn't existing in ChatLabelAssociation
      messageId: association.messageId || null,
    });
  }

  async deleteByLabelId(labelId: string): Promise<void> {
    await this.repository.deleteBy({ labelId: labelId });
  }

  getAssociationsByLabelId(
    labelId: string,
    type: LabelAssociationType,
  ): Promise<LabelAssociation[]> {
    return this.repository.getAllBy({
      type: type,
      labelId: labelId,
    });
  }

  getAssociationsByChatId(chatId: string): Promise<LabelAssociation[]> {
    return this.repository.getAllBy({
      chatId: chatId,
      type: LabelAssociationType.Chat,
    });
  }
}
