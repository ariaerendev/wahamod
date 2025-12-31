import { CustomAttribute } from '@waha/apps/chatwoot/client/CustomAttributesService';

import { CustomAttributeModel, CustomAttributeType } from './client/types';

export enum AttributeKey {
  WA_CHAT_ID = 'waha_whatsapp_chat_id',
  WA_JID = 'waha_whatsapp_jid',
  WA_LID = 'waha_whatsapp_lid',
}

export const CHATWOOT_CUSTOM_ATTRIBUTES: CustomAttribute[] = [
  {
    key: AttributeKey.WA_CHAT_ID,
    name: 'WhatsApp Chat ID',
    description: 'WhatsApp Chat ID',
    type: CustomAttributeType.TEXT,
    model: CustomAttributeModel.CONTACT,
  },
  {
    key: AttributeKey.WA_JID,
    name: 'WhatsApp JID',
    description: 'WhatsApp Phone Number ID',
    type: CustomAttributeType.TEXT,
    model: CustomAttributeModel.CONTACT,
  },
  {
    key: AttributeKey.WA_LID,
    name: 'WhatsApp LID',
    description: 'WhatsApp Linked ID (Anonymous ID)',
    type: CustomAttributeType.TEXT,
    model: CustomAttributeModel.CONTACT,
  },
];

export const INBOX_CONTACT_CHAT_ID = 'whatsapp.integration';
