import * as path from 'node:path';

import { Knex } from 'knex';
import { AppRuntimeConfig } from '@waha/apps/app_sdk/apps/AppRuntime';

function migrateSDK(knex: Knex): Promise<any> {
  const config = {
    directory: `${__dirname}/migrations`,
    tableName: 'apps_migrations',
    loadExtensions: ['.js'],
  };
  return knex.migrate.latest(config);
}

function migrateApp(knex: Knex, app: string): Promise<any> {
  // one level upp
  const appsDirectory = path.join(__dirname, '..', '..', 'apps');
  const directory = path.join(appsDirectory, app, 'migrations');
  const config = {
    directory: directory,
    tableName: `app_${app}_migrations`,
    loadExtensions: ['.js'],
  };
  return knex.migrate.latest(config);
}

export async function migrate(knex: Knex) {
  await migrateSDK(knex);
  for (const app of AppRuntimeConfig.GetAppsWithMigration()) {
    await migrateApp(knex, app.name);
  }
}
