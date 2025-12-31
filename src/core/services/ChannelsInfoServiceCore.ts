import { Injectable } from '@nestjs/common';
import { AvailableInPlusVersion } from '@waha/core/exceptions';
import {
  ChannelCategory,
  ChannelCountry,
  ChannelView,
} from '@waha/structures/channels.dto';

@Injectable()
export class ChannelsInfoServiceCore {
  async getCountries(): Promise<ChannelCountry[]> {
    throw new AvailableInPlusVersion();
  }

  async getCategories(): Promise<ChannelCategory[]> {
    throw new AvailableInPlusVersion();
  }

  async getViews(): Promise<ChannelView[]> {
    throw new AvailableInPlusVersion();
  }
}
