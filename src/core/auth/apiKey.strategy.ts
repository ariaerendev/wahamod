import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { IApiKeyAuth } from '@waha/core/auth/auth';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
  constructor(private auth: IApiKeyAuth) {
    // @ts-ignore
    super({ header: 'X-Api-Key', prefix: '' }, true, (apikey, done) => {
      const isValid = this.auth.isValid(apikey);
      return done(isValid);
    });
  }

  validate(apikey: string, done: (result: boolean) => void): void {
    const isValid = this.auth.isValid(apikey);
    return done(isValid);
  }
}
