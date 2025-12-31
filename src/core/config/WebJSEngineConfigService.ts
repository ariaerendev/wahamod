import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { WebJSConfig } from '../../core/engines/webjs/session.webjs.core';

@Injectable()
export class WebJSEngineConfigService {
  constructor(protected configService: ConfigService) {}

  getConfig(): WebJSConfig {
    let webVersion = this.configService.get<string>(
      'WAHA_WEBJS_WEB_VERSION',
      undefined,
    );
    if (webVersion === '2.2412.54-videofix') {
      // Deprecated version
      webVersion = undefined;
    }
    return {
      webVersion: webVersion,
      cacheType: this.getCacheType(),
      puppeteerArgs: this.getPuppeterArgs(),
    };
  }

  getCacheType(): 'local' | 'none' {
    const cacheType = this.configService
      .get<string>('WAHA_WEBJS_CACHE_TYPE', 'none')
      .toLowerCase();
    if (cacheType != 'local' && cacheType != 'none') {
      throw new Error(
        'Invalid cache type, only "local" and "none" are allowed',
      );
    }

    return cacheType;
  }

  getPuppeterArgs(): string[] {
    const args = this.configService.get<string>('WAHA_WEBJS_PUPPETER_ARGS', '');
    return args
      .split(' ')
      .map((arg) => arg.trim())
      .filter(Boolean);
  }
}
