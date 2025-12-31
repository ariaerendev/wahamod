import { AppRuntimeConfig } from '@waha/apps/app_sdk/apps/AppRuntime';
import { AppsDisabled } from '@waha/apps/apps.module.disabled';
import { AppsEnabled } from '@waha/apps/apps.module.enabled';

export const AppsModuleExports = AppRuntimeConfig.Enabled()
  ? AppsEnabled
  : AppsDisabled;
