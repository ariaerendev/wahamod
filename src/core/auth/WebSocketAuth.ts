import { Injectable } from '@nestjs/common';
import { IncomingMessage } from 'http';
import * as url from 'url';

import { IApiKeyAuth } from './auth';

@Injectable()
export class WebSocketAuth {
  constructor(private auth: IApiKeyAuth) {}

  validateRequest(request: IncomingMessage) {
    if (this.auth.skipAuth()) {
      return true;
    }
    const provided = this.getKeyFromQueryParams(request);
    return this.auth.isValid(provided);
  }

  private getKeyFromQueryParams(request: IncomingMessage) {
    let query = url.parse(request.url, true).query;
    // case-insensitive query params
    query = Object.keys(query).reduce((acc, key) => {
      acc[key.toLowerCase()] = query[key];
      return acc;
    }, {});

    const provided = query['x-api-key'];
    // Check if it's array - return first
    if (Array.isArray(provided)) {
      return provided[0];
    }
    return provided;
  }
}
