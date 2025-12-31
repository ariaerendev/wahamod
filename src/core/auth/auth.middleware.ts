import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import * as passport from 'passport';

import { IApiKeyAuth } from './auth';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private auth: IApiKeyAuth) {}

  use(req: any, res: any, next: () => void) {
    // Skip authentication if auth says so
    if (this.auth.skipAuth()) {
      next();
      return;
    }

    passport.authenticate('headerapikey', { session: false }, (value) => {
      if (!value) {
        throw new UnauthorizedException();
      }
      next();
    })(req, res, next);
  }
}
