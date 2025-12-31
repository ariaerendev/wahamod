import * as lodash from 'lodash';
import type { proto } from '@adiwajshing/baileys';

export function camelCaseKeysDeep<T = any>(input: unknown): T {
  if (Array.isArray(input)) return input.map(camelCaseKeysDeep) as unknown as T;
  if (input && typeof input === 'object') {
    const mapped = lodash.mapKeys(input as Record<string, unknown>, (_v, k) =>
      lodash.camelCase(k),
    );
    return lodash.mapValues(mapped, camelCaseKeysDeep) as unknown as T;
  }
  return input as T;
}

/**
 * Converts GoToJS WA Proto to Baileys Proto Message
 */
export function GoToJSWAProto(data: any): proto.Message | null {
  if (!data) {
    return data;
  }
  return camelCaseKeysDeep(data) as proto.Message;
}

export function resolveProtoMessage(data: any): proto.Message | null {
  // GOWS
  if (data.Message) {
    const protoMessage = data.Message;
    // mediaURL => mediaUrl
    // otherAttributes => otherAttributes
    return camelCaseKeysDeep(protoMessage);
  }

  // NOWEB
  if (data.message) {
    return data.message;
  }
  // WEBJS - not available
  return null;
}
