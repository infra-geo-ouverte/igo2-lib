import { Http, RequestOptions } from '@angular/http';
import { AuthHttp, AuthConfig } from 'angular2-jwt';

import { ConfigService } from '../../core';

export function authHttpServiceFactory(http: Http, options: RequestOptions,
  config: ConfigService) {

  const authConfig = config.getConfig('auth') || {};

  return new AuthHttp(new AuthConfig({
    headerName: 'Authorization',
    headerPrefix: '',
    tokenName: authConfig.tokenKey,
    tokenGetter: (() => localStorage.getItem(authConfig.tokenKey)),
    noJwtError: true
  }), http, options);
}
