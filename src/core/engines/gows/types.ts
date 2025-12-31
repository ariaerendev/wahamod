export interface Presence {
  From: string;
  Unavailable: boolean;
  LastSeen: string;
}

export enum ChatPresenceState {
  COMPOSING = 'composing',
  PAUSED = 'paused',
}

export enum ChatPresenceMedia {
  TEXT = '',
  AUDIO = 'audio',
}

export interface ChatPresence {
  Chat: string;
  Sender: string;
  IsFromMe: boolean;
  IsGroup: boolean;
  State: ChatPresenceState;
  Media: ChatPresenceMedia;
}

/**
 *  StatusError       Status = 0
 *  StatusPending     Status = 1
 *  StatusServerAck   Status = 2
 *  StatusDeliveryAck Status = 3
 *  StatusRead        Status = 4
 *  StatusPlayed      Status = 5
 */
export enum MessageStatus {
  Error = 0,
  Pending = 1,
  ServerAck = 2,
  DeliveryAck = 3,
  Read = 4,
  Played = 5,
}

export interface LabelEditAction {
  name: string;
  color: number;
  deleted: boolean;
  orderIndex: number;
  isActive: boolean;
  type: number;
}

export interface LabelEdit {
  Timestamp: string;
  LabelID: string;
  Action: LabelEditAction;
  FromFullSync: boolean;
}

export interface LabelAssociationChatAction {
  labeled: boolean;
}

export interface LabelAssociationChat {
  JID: string;
  Timestamp: string;
  LabelID: string;
  Action: LabelAssociationChatAction;
  FromFullSync: boolean;
}
