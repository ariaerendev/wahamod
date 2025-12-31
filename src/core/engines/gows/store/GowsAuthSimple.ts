import { GowsAuth } from '@waha/core/engines/gows/store/GowsAuth';

export class GowsAuthSimple implements GowsAuth {
  private _address: string;
  private _dialect: string;

  constructor(address: string, dialect: string) {
    this._address = address;
    this._dialect = dialect;
  }

  address() {
    return this._address;
  }

  dialect(): string {
    return this._dialect;
  }
}
