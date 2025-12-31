import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { parseBool } from '../../helpers';
import { Auth } from '@waha/core/auth/config';

@Injectable()
export class DashboardConfigServiceCore {
  public dashboardUri = '/dashboard';

  constructor(
    protected configService: ConfigService,
    @InjectPinoLogger('DashboardConfigService')
    protected logger: PinoLogger,
  ) {}

  get enabled(): boolean {
    const value = this.configService.get('WAHA_DASHBOARD_ENABLED', 'true');
    return parseBool(value);
  }

  get credentials(): [string, string] | null {
    const user = Auth.dashboard.username.value || '';
    const password = Auth.dashboard.password.value || '';
    if (!user && !password) {
      return null;
    }
    if ((user && !password) || (!user && password)) {
      this.logger.warn(
        'Set up both WAHA_DASHBOARD_USERNAME and WAHA_DASHBOARD_PASSWORD ' +
          'to enable dashboard authentication.',
      );
      return null;
    }
    return [user, password];
  }
}
