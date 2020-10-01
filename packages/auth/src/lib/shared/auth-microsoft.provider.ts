import {
  MSAL_CONFIG,
  MSAL_CONFIG_ANGULAR,
  MsalAngularConfiguration,
  MsalService
} from '@azure/msal-angular';
import { Configuration } from 'msal';

import { ConfigService } from '@igo2/core';
import { AuthMicrosoftOptions } from './auth.interface';

export function MSALConfigFactory(config: ConfigService): Configuration {
  const msConf: AuthMicrosoftOptions = config.getConfig('auth.microsoft') || {};
  return {
    auth: {
      clientId: msConf.clientId,
      authority: 'https://login.microsoftonline.com/organizations', // 'common'
      redirectUri: window.location.href
    },
    cache: {
      cacheLocation: 'sessionStorage'
    }
  };
}

export function MSALAngularConfigFactory(): MsalAngularConfiguration {
  return {
    popUp: true,
    consentScopes: ['user.read']
  };
}

export function provideAuthMicrosoft() {
  return [
    {
      provide: MSAL_CONFIG,
      useFactory: MSALConfigFactory,
      deps: [ConfigService]
    },
    {
      provide: MSAL_CONFIG_ANGULAR,
      useFactory: MSALAngularConfigFactory
    },
    MsalService
  ];
}
