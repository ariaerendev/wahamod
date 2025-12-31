import type { proto } from '@adiwajshing/baileys';
import { WALocation } from '@waha/structures/responses.dto';
import * as lodash from 'lodash';
import { ensureBase64 } from '@waha/utils/bytes';

export function extractWALocation(waproto: proto.Message): WALocation | null {
  if (!waproto) {
    return null;
  }
  if (!lodash.isEmpty(waproto.locationMessage)) {
    const location = waproto.locationMessage;
    return {
      live: false,
      latitude: location.degreesLatitude?.toString(),
      longitude: location.degreesLongitude?.toString(),
      name: location.name,
      address: location.address,
      url: location.url,
      description: location.comment,
      thumbnail: ensureBase64(location.jpegThumbnail),
    };
  }
  if (!lodash.isEmpty(waproto.liveLocationMessage)) {
    const location = waproto.liveLocationMessage;
    return {
      live: true,
      latitude: location.degreesLatitude?.toString(),
      longitude: location.degreesLongitude?.toString(),
      description: location.caption,
      thumbnail: ensureBase64(location.jpegThumbnail),
    };
  }
  return null;
}
