import type { BinaryNode, WAPresence } from '@adiwajshing/baileys';
import { WAHAPresenceStatus } from '@waha/structures/enums.dto';
import { WAHAChatPresences } from '@waha/structures/presence.dto';

import { jid } from './ack.webjs';
import { toCusFormat } from '@waha/core/utils/jids';

export function TagPresenceToPresence(node: BinaryNode): WAHAChatPresences {
  const { attrs } = node;
  const id = jid(attrs.from);
  const state =
    attrs.type === 'unavailable'
      ? WAHAPresenceStatus.OFFLINE
      : WAHAPresenceStatus.ONLINE;
  const lastSeen = attrs.last && attrs.last !== 'deny' ? +attrs.last : null;
  return {
    id: toCusFormat(id),
    presences: [
      {
        participant: toCusFormat(id),
        lastKnownPresence: state,
        lastSeen: lastSeen,
      },
    ],
  };
}

export function TagChatstateToPresence(node: BinaryNode): WAHAChatPresences {
  const { attrs, content } = node;
  const id = jid(attrs.from);
  const participant = jid(attrs.participant) || jid(attrs.from);

  const firstChild = content[0] as BinaryNode;

  const type = firstChild.tag as WAPresence;
  let status = WAHAPresenceStatus.OFFLINE;

  switch (type) {
    case 'unavailable':
      status = WAHAPresenceStatus.OFFLINE;
      break;
    case 'available':
      status = WAHAPresenceStatus.ONLINE;
      break;
    case 'paused':
      status = WAHAPresenceStatus.PAUSED;
      break;
    case 'composing':
      status = WAHAPresenceStatus.TYPING;
      break;
  }

  if (firstChild.attrs?.media === 'audio') {
    status = WAHAPresenceStatus.RECORDING;
  }

  return {
    id: toCusFormat(id),
    presences: [
      {
        participant: toCusFormat(participant),
        lastKnownPresence: status,
        lastSeen: null,
      },
    ],
  };
}
