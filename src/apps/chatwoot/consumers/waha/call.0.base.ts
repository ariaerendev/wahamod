import { CallData } from '@waha/structures/calls.dto';
import { MessageSource } from '@waha/structures/responses.dto';
import { SerializeMessageKey } from '@waha/core/utils/ids';
import { WAHAEvents } from '@waha/structures/enums.dto';
import { MessageBaseHandlerPayload } from '@waha/apps/chatwoot/consumers/waha/base';
import { EngineHelper } from '@waha/apps/chatwoot/waha';

export function ShouldProcessCall(event: { payload: CallData }): boolean {
  if (event.payload.isGroup) {
    // No group calls for now
    // GroupJID (group-jid tag) is empty in all cases
    // and the "call" appears in the 1-1 chat
    // with the participant who started the call
    return false;
  }
  return true;
}

// The MessageBaseHandler works on top of "MessageBase",
// but we need the call original properties, so we keep it here
export type CallMessagePayload = CallData &
  MessageBaseHandlerPayload & { callId: string };

const SUFFIX = {
  [WAHAEvents.CALL_RECEIVED]: '0',
  [WAHAEvents.CALL_ACCEPTED]: '1',
  [WAHAEvents.CALL_REJECTED]: '2',
};
type Events = keyof typeof SUFFIX;

/**
 * So we can reference from "accepted" or "rejected" to the first one, "received"
 * and "reply" to it
 */
export function BuildFakeCallMessageId(id: string, event: Events) {
  return id + SUFFIX[event];
}

export function BuildCallMessagePayload(
  call: CallData,
  event: Events,
): CallMessagePayload {
  const key = {
    fromMe: false,
    remoteJid: EngineHelper.CallChatID(call),
    id: BuildFakeCallMessageId(call.id, event),
  };
  const id = SerializeMessageKey(key);
  return {
    ...call,
    callId: call.id,
    id: id,
    // Use the "Creator" one if there's any
    from: EngineHelper.CallChatID(call),
    fromMe: false,
    source: MessageSource.APP,
  };
}
