import ChatwootClient, {
  contact_update,
  public_contact_create_update_payload,
} from '@figuro/chatwoot-sdk';
import type { contact } from '@figuro/chatwoot-sdk/dist/models/contact';
import type { generic_id } from '@figuro/chatwoot-sdk/dist/models/generic_id';
import { ILogger } from '@waha/apps/app_sdk/ILogger';
import {
  ChatWootAPIConfig,
  ChatWootInboxAPI,
} from '@waha/apps/chatwoot/client/interfaces';
import { isJidCusFormat } from '@waha/utils/wa';
import * as lodash from 'lodash';

import { AttributeKey } from '../const';
import { E164Parser } from '@waha/core/utils/PhoneJidNormalizer';
import { ContactInfo } from '@waha/apps/chatwoot/client/ContactConversationService';

export interface ContactResponse {
  data: generic_id & contact;
  sourceId: string;
}

export enum AvatarUpdateMode {
  IF_MISSING,
  ALWAYS,
}

export function sanitizeName(name: string) {
  // 255 chars max
  const limit = 255;
  if (!name) {
    return name;
  }
  if (name.length < limit) {
    return name;
  }
  // remove only bidi controls
  const clean = name.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '');
  return clean.slice(0, 255).trim();
}

export class ContactService {
  constructor(
    private config: ChatWootAPIConfig,
    private accountAPI: ChatwootClient,
    protected inboxAPI: ChatWootInboxAPI,
    private logger: ILogger,
  ) {}

  async findOrCreateContact(
    contactInfo: ContactInfo,
  ): Promise<[ContactResponse, boolean]> {
    const chatId = contactInfo.ChatId();
    let contact = await this.searchByAnyID(chatId);
    if (contact) {
      return [contact, false];
    }

    const request = await contactInfo.PublicContactCreate();
    contact = await this.create(chatId, request);
    return [contact, true];
  }

  async searchByAnyID(chatId: string): Promise<ContactResponse | null> {
    const payload: any[] = [
      {
        attribute_key: AttributeKey.WA_CHAT_ID,
        filter_operator: 'equal_to',
        values: [chatId],
        attribute_model: 'standard',
        custom_attribute_type: '',
        query_operator: 'OR',
      },
      {
        attribute_key: AttributeKey.WA_JID,
        filter_operator: 'equal_to',
        values: [chatId],
        attribute_model: 'standard',
        custom_attribute_type: '',
        query_operator: 'OR',
      },
      {
        attribute_key: AttributeKey.WA_LID,
        filter_operator: 'equal_to',
        values: [chatId],
        attribute_model: 'standard',
        custom_attribute_type: '',
        query_operator: 'OR',
      },
      {
        attribute_key: 'identifier',
        filter_operator: 'equal_to',
        values: [chatId],
        attribute_model: 'standard',
        custom_attribute_type: '',
      },
    ];

    if (isJidCusFormat(chatId)) {
      // Search by phone
      const phoneNumberE164 = E164Parser.fromJid(chatId);
      const phone_number = phoneNumberE164.replace('+', '');
      payload[payload.length - 1].query_operator = 'OR';
      payload.push({
        attribute_key: 'phone_number',
        filter_operator: 'equal_to',
        values: [phone_number],
      });
    }

    const response: any = await this.accountAPI.contacts.filter({
      accountId: this.config.accountId,
      payload: payload as any,
    });

    const contacts = response.payload;
    if (contacts.length == 0) {
      return null;
    }
    const contact = contacts[0];
    const inboxes = lodash.filter(contact.contact_inboxes, {
      inbox: { id: this.config.inboxId },
    });
    if (inboxes.length == 0) {
      return null;
    }
    return {
      data: contact,
      sourceId: inboxes[0].source_id,
    };
  }

  public async upsertCustomAttributes(
    contact: generic_id & contact,
    attributes: any,
  ): Promise<boolean> {
    if (lodash.isEqual(attributes, contact.custom_attributes)) {
      return false;
    }
    const update: contact_update = {
      custom_attributes: { ...contact.custom_attributes, ...attributes },
    };
    await this.accountAPI.contacts.update({
      id: contact.id,
      accountId: this.config.accountId,
      data: update,
    });
    return true;
  }

  public async create(
    chatId: string,
    payload: public_contact_create_update_payload,
  ): Promise<ContactResponse> {
    payload.name = sanitizeName(payload.name);
    const contact = await this.inboxAPI.contacts.create({
      inboxIdentifier: this.config.inboxIdentifier,
      data: payload,
    });
    this.logger.info(
      `Created contact for chat.id: ${chatId}, contact.id: ${contact.source_id}`,
    );
    const response: any = await this.accountAPI.contacts.get({
      accountId: this.config.accountId,
      id: contact.id,
    });
    return {
      data: response.payload,
      sourceId: contact.source_id,
    };
  }

  public async updateAvatar(
    contact: ContactResponse,
    contactInfo: ContactInfo,
    mode: AvatarUpdateMode,
  ): Promise<boolean> {
    // Update Avatar if nothing, but keep the original one if any
    if (contact.data.thumbnail && mode == AvatarUpdateMode.IF_MISSING) {
      return false;
    }
    const chatId = contactInfo.ChatId();
    const avatarUrl = await contactInfo.AvatarUrl().catch((err) => {
      this.logger.warn(
        `Error getting avatar for chat.id from WhatsApp: ${chatId}`,
      );
      this.logger.warn(err);
      return null;
    });
    if (!avatarUrl) {
      return false;
    }
    const success = await this.updateAvatarUrlSafe(contact.data.id, avatarUrl);
    return success;
  }

  public updateAvatarUrlSafe(contactId, avatarUrl: string): Promise<boolean> {
    return this.accountAPI.contacts
      .update({
        accountId: this.config.accountId,
        id: contactId,
        data: {
          avatar_url: avatarUrl,
        },
      })
      .then(() => {
        return true;
      })
      .catch((e) => {
        this.logger.warn(
          `Error updating avatar_url for contact.id: ${contactId}`,
        );
        this.logger.warn(e);
        return true;
      });
  }
}
