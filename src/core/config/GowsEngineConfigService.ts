import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsappConfigService } from '@waha/config.service';
import { BootstrapConfig } from '@waha/core/engines/gows/GowsBootstrap';
import { GowsConfig } from '@waha/core/engines/gows/session.gows.core';

@Injectable()
export class GowsEngineConfigService {
  constructor(
    protected configService: ConfigService,
    protected whatsappConfigService: WhatsappConfigService,
  ) {}

  getBootstrapConfig(): BootstrapConfig {
    return {
      path: this.configService.get('WAHA_GOWS_PATH'),
      socket: this.getSocket(),
      pprof: this.whatsappConfigService.debugModeEnabled,
    };
  }

  getSocket() {
    return this.configService.get('WAHA_GOWS_SOCKET', '/tmp/gows.sock');
  }

  getConfig(): GowsConfig {
    return {
      connection: 'unix:' + this.getSocket(),
    };
  }
}
