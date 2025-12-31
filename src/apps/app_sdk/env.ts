import { parseBool } from '@waha/helpers';

function parseCommaSeparatedList(value: string | undefined): string[] {
  if (!value) {
    return null;
  }
  return value.split(',').map((item) => item.trim());
}

export const AppEnv = {
  enabled: parseBool(process.env.WAHA_APPS_ENABLED),
  on: parseCommaSeparatedList(process.env.WAHA_APPS_ON),
  off: parseCommaSeparatedList(process.env.WAHA_APPS_OFF),
};
