import { App } from '@waha/apps/app_sdk/dto/app.dto';

export interface AppDB extends App {
  // Internal database number
  pk: number;
}
