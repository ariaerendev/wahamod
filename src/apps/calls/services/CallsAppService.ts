import { Injectable } from '@nestjs/common';
import { App } from '@waha/apps/app_sdk/dto/app.dto';
import { IAppService } from '@waha/apps/app_sdk/services/IAppService';
import { CallsAppConfig } from '@waha/apps/calls/dto/config.dto';
import { WhatsappSession } from '@waha/core/abc/session.abc';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CallsListener } from '@waha/apps/calls/services/CallsListener';

@Injectable()
export class CallsAppService implements IAppService {
  constructor(
    @InjectPinoLogger('CallsAppService')
    private readonly logger: PinoLogger,
  ) {}

  validate(app: App<CallsAppConfig>): void {
    // The DTO validation covers structure; no extra validation rules.
    void app;
    return;
  }

  async beforeCreated(app: App<CallsAppConfig>): Promise<void> {
    void app;
    return;
  }

  async beforeEnabled(
    savedApp: App<CallsAppConfig>,
    newApp: App<CallsAppConfig>,
  ): Promise<void> {
    // Enabling behaves the same as creating for this lightweight app.
    void savedApp;
    void newApp;
    return;
  }

  async beforeDisabled(
    savedApp: App<CallsAppConfig>,
    newApp: App<CallsAppConfig>,
  ): Promise<void> {
    void newApp;
    void savedApp;
  }

  async beforeUpdated(
    savedApp: App<CallsAppConfig>,
    newApp: App<CallsAppConfig>,
  ): Promise<void> {
    void savedApp;
    void newApp;
  }

  async beforeDeleted(app: App<CallsAppConfig>): Promise<void> {
    void app;
  }

  beforeSessionStart(app: App<CallsAppConfig>, session: WhatsappSession): void {
    const listener = new CallsListener(app, session, this.logger);
    listener.attach();
  }

  afterSessionStart(app: App<CallsAppConfig>, session: WhatsappSession): void {
    void app;
    void session;
    return;
  }
}
