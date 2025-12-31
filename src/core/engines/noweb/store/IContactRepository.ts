import type { Contact } from '@adiwajshing/baileys';
import { PaginationParams } from '@waha/structures/pagination.dto';

export interface IContactRepository {
  getAll(pagination?: PaginationParams): Promise<Contact[]>;

  getById(id: string): Promise<Contact | null>;

  deleteAll(): Promise<void>;

  deleteById(id: string): Promise<void>;

  save(contact: Contact): Promise<void>;

  upsertMany(contacts: Contact[]): Promise<void>;

  getEntitiesByIds(ids: string[]): Promise<Map<string, Contact | null>>;
}
