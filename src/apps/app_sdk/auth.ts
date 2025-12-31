import * as process from 'node:process';

import { parseBool } from '@waha/helpers';
import * as basicAuth from 'express-basic-auth';
import { Auth } from '@waha/core/auth/config';

export function BullAuthMiddleware() {
  let username = Auth.dashboard.username.value || '';
  let password = Auth.dashboard.password.value || '';
  if (process.env.WAHA_DASHBOARD_ENABLED) {
    const enabled = parseBool(process.env.WAHA_DASHBOARD_ENABLED);
    if (!enabled) {
      // Generate a random uuid4 username/password to effectively disable access
      username = 'admin';
      password = crypto.randomUUID();
    }
  }

  return basicAuth({
    challenge: true,
    users: {
      [String(username)]: String(password),
    },
  });
}
