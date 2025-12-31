import { AppEnv } from '@waha/apps/app_sdk/env';
import { AppDefinition, APPS } from '@waha/apps/app_sdk/apps/definition';
import { AppName } from '@waha/apps/app_sdk/apps/name';

class AppRuntimeConfigC {
  private constructor(private apps: AppDefinition[] | null) {}

  static FromEnv(env: typeof AppEnv) {
    if (!env.enabled) {
      return new AppRuntimeConfigC(null);
    }
    let apps = Object.values(APPS);
    // Include
    if (env.on && env.on.length > 0) {
      apps = apps.filter((app) => env.on!.includes(app.name));
    }
    // Exclude
    if (env.off && env.off.length > 0) {
      apps = apps.filter((app) => !env.off!.includes(app.name));
    }
    return new AppRuntimeConfigC(apps);
  }

  Enabled() {
    return this.apps !== null;
  }

  GetApps() {
    return this.apps || [];
  }

  GetAppsWithMigration() {
    return this.GetApps().filter((app) => app.migrations);
  }

  GetAppsRequiringPlainKey() {
    return this.GetApps().filter((app) => app.plainkey);
  }

  GetAppsRequiringQueue() {
    return this.GetApps().filter((app) => app.queue);
  }

  HasApp(name: AppName) {
    return this.GetApps().some((app) => app.name === name);
  }

  HasAppsRequiringPlainKey() {
    return this.GetAppsRequiringPlainKey().length > 0;
  }

  HasAppsRequiringQueue() {
    return this.GetAppsRequiringQueue().length > 0;
  }
}

export const AppRuntimeConfig = AppRuntimeConfigC.FromEnv(AppEnv);
