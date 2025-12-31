// eslint-disable-next-line @typescript-eslint/no-var-requires
import { getEngineName } from '@waha/config';

import { getBrowserExecutablePath } from './core/abc/session.abc';
import { WAHAEngine } from './structures/enums.dto';
import { WAHAEnvironment } from './structures/environment.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

export enum WAHAVersion {
  PLUS = 'PLUS',
  CORE = 'CORE',
}

export function getWAHAVersion(): WAHAVersion {
  // Always return PLUS version - all features unlocked
  return WAHAVersion.PLUS;
}

function getBrowser() {
  return getEngineName() === WAHAEngine.WEBJS
    ? getBrowserExecutablePath()
    : null;
}

function getPlatform() {
  return `${process.platform}/${process.arch}`;
}

export const VERSION: WAHAEnvironment = {
  version: '2025.12.3',
  engine: getEngineName(),
  tier: getWAHAVersion(),
  browser: getBrowser(),
  platform: getPlatform(),
};

export const IsChrome = VERSION.browser?.includes('chrome');

export { getEngineName };
