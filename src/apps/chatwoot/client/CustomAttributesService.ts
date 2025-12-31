import ChatwootClient from '@figuro/chatwoot-sdk';
import { ChatWootAccountAPIConfig } from '@waha/apps/chatwoot/client/interfaces';
import {
  CustomAttributeModel,
  CustomAttributeType,
} from '@waha/apps/chatwoot/client/types';
import type { custom_attribute } from '@figuro/chatwoot-sdk/dist/models/custom_attribute';

export interface CustomAttribute {
  key: string;
  name: string;
  type: CustomAttributeType;
  description: string;
  model: CustomAttributeModel;
}

export class CustomAttributesService {
  constructor(
    private config: ChatWootAccountAPIConfig,
    private accountAPI: ChatwootClient,
  ) {}

  async upsert(attributes: Array<CustomAttribute>): Promise<void> {
    const current: Record<CustomAttributeModel, Array<custom_attribute>> = {
      [CustomAttributeModel.CONVERSATION]: [],
      [CustomAttributeModel.CONTACT]: [],
    };
    const models = [
      CustomAttributeModel.CONVERSATION,
      CustomAttributeModel.CONTACT,
    ];
    for (const model of models) {
      current[model] = await this.accountAPI.customAttributes.list({
        accountId: this.config.accountId,
        attributeModel: String(model) as '0' | '1',
      });
    }

    for (const attribute of attributes) {
      const existing = current[attribute.model].find(
        (a) => a.attribute_key === attribute.key,
      );
      if (existing) {
        await this.accountAPI.customAttributes.update({
          accountId: this.config.accountId,
          id: existing.id,
          data: {
            attribute_key: attribute.key,
            attribute_display_name: attribute.name,
            attribute_display_type: attribute.type,
            attribute_description: attribute.description,
          },
        });
      } else {
        await this.accountAPI.customAttributes.create({
          accountId: this.config.accountId,
          data: {
            attribute_key: attribute.key,
            attribute_display_name: attribute.name,
            attribute_display_type: attribute.type,
            attribute_description: attribute.description,
            attribute_model: attribute.model,
          },
        });
      }
    }
  }
}
