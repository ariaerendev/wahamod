import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { parseBool } from '../../helpers';
import { Auth } from '@waha/core/auth/config';

@Injectable()
export class SwaggerConfigServiceCore {
  constructor(
    protected configService: ConfigService,
    @InjectPinoLogger('SwaggerConfigService')
    protected logger: PinoLogger,
  ) {}

  get advancedConfigEnabled(): boolean {
    const value = this.configService.get(
      'WHATSAPP_SWAGGER_CONFIG_ADVANCED',
      false,
    );
    return parseBool(value);
  }

  get enabled(): boolean {
    const value = this.configService.get('WHATSAPP_SWAGGER_ENABLED', 'true');
    return parseBool(value);
  }

  get credentials(): [string, string] | undefined {
    const user = Auth.swagger.username.value;
    const password = Auth.swagger.password.value;
    if (!user && !password) {
      return null;
    }
    if ((user && !password) || (!user && password)) {
      this.logger.warn(
        'Set up both WHATSAPP_SWAGGER_USERNAME and WHATSAPP_SWAGGER_PASSWORD ' +
          'to enable swagger authentication.',
      );
      return null;
    }
    return [user, password];
  }

  get title() {
    return this.configService.get('WHATSAPP_SWAGGER_TITLE', '');
  }

  get description() {
    return this.configService.get('WHATSAPP_SWAGGER_DESCRIPTION', '');
  }

  get externalDocUrl() {
    return this.configService.get('WHATSAPP_SWAGGER_EXTERNAL_DOC_URL', '');
  }
}
