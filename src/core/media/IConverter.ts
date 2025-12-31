import { AvailableInPlusVersion } from '../exceptions';

export interface IMediaConverter {
  voice(content: Buffer): Promise<Buffer>;
  video(content: Buffer): Promise<Buffer>;
}

export class CoreMediaConverter implements IMediaConverter {
  video(content: Buffer): Promise<Buffer> {
    throw new AvailableInPlusVersion();
  }

  voice(content: Buffer): Promise<Buffer> {
    throw new AvailableInPlusVersion();
  }
}
