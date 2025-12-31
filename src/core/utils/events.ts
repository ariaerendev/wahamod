import { EventResponseType } from '@waha/structures/events.dto';

export function ParseEventResponseType(response: number) {
  switch (response) {
    case 0:
      return EventResponseType.UNKNOWN;
    case 1:
      return EventResponseType.GOING;
    case 2:
      return EventResponseType.NOT_GOING;
    case 3:
      return EventResponseType.MAYBE;
    default:
      return EventResponseType.UNKNOWN;
  }
}
