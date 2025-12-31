import { messages } from '@waha/core/engines/gows/grpc/gows';
import { MessageStatus } from '@waha/core/engines/gows/types';
import { WAMessageAck } from '@waha/structures/enums.dto';

export function optional(value: any, type) {
  if (value === null || value === undefined) {
    return null;
  }
  return new type({ value: value });
}

export function parseJson(value: messages.Json | { data?: string }) {
  if (value instanceof messages.Json) {
    value = value.toObject();
  }
  if (value.data === undefined) {
    return undefined;
  }
  return JSON.parse(value.data);
}

export function parseJsonList(value: messages.JsonList) {
  return value.toObject().elements.map((value) => parseJson(value));
}

export function statusToAck(status: MessageStatus): WAMessageAck | null {
  switch (status) {
    case MessageStatus.Error:
      return WAMessageAck.ERROR;
    case MessageStatus.Pending:
      return WAMessageAck.PENDING;
    case MessageStatus.ServerAck:
      return WAMessageAck.SERVER;
    case MessageStatus.DeliveryAck:
      return WAMessageAck.DEVICE;
    case MessageStatus.Read:
      return WAMessageAck.READ;
    case MessageStatus.Played:
      return WAMessageAck.PLAYED;
  }
  return null;
}
