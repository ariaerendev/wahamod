import { WAHAEngine } from '@waha/structures/enums.dto';

export function getEngineName(): string {
  //   Load engine name from WHATSAPP_DEFAULT_ENGINE environment variable
  //   If not set - use WEBJS
  return process.env.WHATSAPP_DEFAULT_ENGINE || WAHAEngine.WEBJS;
}
