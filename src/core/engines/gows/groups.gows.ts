import {
  GOWSGroupParticipant,
  GroupInfoEvent,
  GroupInfoFull,
  JoinedGroupEvent,
} from '@waha/core/engines/gows/types.group';
import { toCusFormat, toJID } from '@waha/core/utils/jids';
import {
  GroupId,
  GroupInfo,
  GroupParticipant,
  GroupParticipantRole,
} from '@waha/structures/groups.dto';
import {
  GroupParticipantType,
  GroupV2JoinEvent,
  GroupV2LeaveEvent,
  GroupV2ParticipantsEvent,
  GroupV2UpdateEvent,
} from '@waha/structures/groups.events.dto';
import { MeInfo } from '@waha/structures/sessions.dto';

export function ToGroupV2JoinEvent(event: JoinedGroupEvent): GroupV2JoinEvent {
  return {
    timestamp: Date.now(),
    group: ToGroupInfo(event),
    _data: event,
  };
}

export function ToGroupV2LeaveEvent(
  me: MeInfo | null,
  event: GroupInfoEvent,
): GroupV2LeaveEvent | null {
  if (!event.Leave || event.Leave.length === 0) {
    return null;
  }
  if (!me?.id) {
    return null;
  }
  const jid = toJID(me.id);
  const left = event.Leave;
  if (!left.includes(jid)) {
    return null;
  }
  return {
    timestamp: Date.now(),
    group: {
      id: event.JID,
    },
    _data: event,
  };
}

export function ToGroupV2UpdateEvent(
  event: GroupInfoEvent,
): GroupV2UpdateEvent | null {
  const group = ToGroupInfoPartial(event);
  if (!group) {
    return null;
  }
  return {
    timestamp: Date.now(),
    group: group,
    _data: event,
  };
}

export function ToGroupV2ParticipantsEvents(
  event: GroupInfoEvent,
): GroupV2ParticipantsEvent[] {
  const id: GroupId = {
    id: event.JID,
  };
  const events: GroupV2ParticipantsEvent[] = [];
  const maps = [
    { participants: event.Leave, type: GroupParticipantType.LEAVE },
    { participants: event.Join, type: GroupParticipantType.JOIN },
    { participants: event.Promote, type: GroupParticipantType.PROMOTE },
    { participants: event.Demote, type: GroupParticipantType.DEMOTE },
  ];
  for (const map of maps) {
    const participants = getParticipants(map.participants, map.type);
    if (participants) {
      events.push({
        group: id,
        type: map.type,
        timestamp: Date.now(),
        participants: participants,
        _data: event,
      });
    }
  }
  return events;
}

function getParticipants(jids: string[] | null, type: GroupParticipantType) {
  if (!jids) {
    return;
  }
  let role: GroupParticipantRole;
  switch (type) {
    case GroupParticipantType.JOIN:
      role = GroupParticipantRole.PARTICIPANT;
      break;
    case GroupParticipantType.LEAVE:
      role = GroupParticipantRole.LEFT;
      break;
    case GroupParticipantType.PROMOTE:
      role = GroupParticipantRole.ADMIN;
      break;
    case GroupParticipantType.DEMOTE:
      role = GroupParticipantRole.PARTICIPANT;
      break;
  }
  const participants: GroupParticipant[] = [];
  for (const jid of jids) {
    participants.push({
      id: toCusFormat(jid),
      role: role,
    });
  }
  return participants;
}

function ToGroupInfo(group: GroupInfoFull): GroupInfo {
  const participants: GroupParticipant[] = ToGroupParticipants(
    group.Participants,
  );
  return {
    id: group.JID,
    subject: group.Name,
    description: group.Topic,
    invite: undefined,
    participants: participants,
    membersCanAddNewMember: group.MemberAddMode === 'all_member_add',
    membersCanSendMessages: !!group.IsAnnounce,
    newMembersApprovalRequired: group.IsJoinApprovalRequired,
  };
}

function ToGroupInfoPartial(group: GroupInfoEvent): GroupInfo | null {
  const announce: boolean | undefined = group.Announce?.IsAnnounce;
  let membersCanSendMessages: boolean | undefined;
  // revert announce or undefined
  if (announce === undefined) {
    membersCanSendMessages = undefined;
  } else {
    membersCanSendMessages = !announce;
  }

  const info = {
    id: group.JID,
    subject: group.Name?.Name,
    description: group.Topic?.Topic,
    invite: group.NewInviteLink || undefined,
    membersCanAddNewMember: undefined,
    membersCanSendMessages: membersCanSendMessages,
    newMembersApprovalRequired:
      group.MembershipApprovalMode?.IsJoinApprovalRequired,
    participants: undefined,
  };
  // check if all fields are undefined but id - return null
  for (const key in info) {
    if (key !== 'id' && info[key] !== undefined) {
      return info;
    }
  }
  return null;
}

export function ToGroupParticipants(
  participants: GOWSGroupParticipant[],
): GroupParticipant[] {
  const result: GroupParticipant[] = [];
  for (const participant of participants) {
    let role: GroupParticipantRole;
    if (participant.IsSuperAdmin) {
      role = GroupParticipantRole.SUPERADMIN;
    } else if (participant.IsAdmin) {
      role = GroupParticipantRole.ADMIN;
    } else {
      role = GroupParticipantRole.PARTICIPANT;
    }
    result.push({
      id: toCusFormat(participant.JID),
      pn: toCusFormat(participant.PhoneNumber),
      role: role,
    });
  }
  return result;
}
