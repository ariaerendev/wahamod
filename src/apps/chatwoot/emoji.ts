import { WAHASessionStatus, WAMessageAck } from '@waha/structures/enums.dto';

export function SessionStatusEmoji(status: WAHASessionStatus): string {
  switch (status) {
    case WAHASessionStatus.STOPPED:
      return '⚠️';
    case WAHASessionStatus.STARTING:
      return '⏳';
    case WAHASessionStatus.SCAN_QR_CODE:
      return '⚠️';
    case WAHASessionStatus.WORKING:
      return '🟢';
    case WAHASessionStatus.FAILED:
      return '🛑';
    default:
      return '❓';
  }
}

export function MessageAckEmoji(ack: WAMessageAck) {
  switch (ack) {
    case WAMessageAck.ERROR:
      return '❌';
    case WAMessageAck.PENDING:
      return '⏳';
    case WAMessageAck.SERVER:
      return '✔️';
    case WAMessageAck.DEVICE:
      return '✔️';
    case WAMessageAck.READ:
      return '✅';
    case WAMessageAck.PLAYED:
      return '✅';
    default:
      return '❔';
  }
}
