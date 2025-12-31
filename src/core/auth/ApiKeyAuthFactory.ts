import { LoggerService } from '@nestjs/common';
import { WhatsappConfigService } from '@waha/config.service';
import {
  HashAuth,
  IApiKeyAuth,
  NoAuth,
  PlainApiKeyAuth,
} from '@waha/core/auth/auth';
import { ReportGeneratedValue } from '@waha/core/auth/config';

export function ApiKeyAuthFactory(
  config: WhatsappConfigService,
  logger: LoggerService,
): IApiKeyAuth {
  setTimeout(() => {
    ReportGeneratedValue();
  }, 4000);
  const apiKey = config.getApiKey();
  if (!apiKey) {
    setTimeout(() => {
      logger.warn('🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫');
      logger.warn('WARNING: No API key detected. This is a security risk.');
      logger.warn(
        'Your API is publicly accessible without any authentication.',
      );
      logger.warn(
        'To secure your API, set environment variable: WAHA_API_KEY=your_api_key',
      );
      logger.warn(
        'For better security, use WAHA_API_KEY=sha512:{SHA512_HASH_FOR_YOUR_API_KEY}',
      );
      logger.warn('🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫🚫');
    }, 3000);
    return new NoAuth();
  }

  if (apiKey.startsWith('sha512:')) {
    const hash = apiKey.slice(7);
    return new HashAuth(hash, 'sha512');
  }

  // Fallback to plain text
  return new PlainApiKeyAuth(apiKey);
}
