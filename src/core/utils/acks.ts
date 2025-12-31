import { WAMessageAck } from '@waha/structures/enums.dto';

export function StatusToAck(status: number): WAMessageAck {
  return status - 1;
}

export function AckToStatus(ack: number): number {
  return ack + 1;
}
