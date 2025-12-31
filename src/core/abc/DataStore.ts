import Knex from 'knex';

export abstract class DataStore {
  abstract init(sessionName?: string): Promise<void>;

  abstract close(): Promise<any>;

  abstract getWAHADatabase(): Knex.Knex;
}
