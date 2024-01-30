import { ConfigService } from '@igo2/core/config';

import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MsalService
} from '@azure/msal-angular';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { BrowserAuthOptions } from '@azure/msal-browser';

import {
  AuthMicrosoftOptions,
  MSPMsalGuardConfiguration
} from '../shared/auth-form.interface';
import { MsalServiceb2c } from './auth-msalServiceb2c.service';

export function MSALConfigFactory(
  config: ConfigService
): PublicClientApplication {
  const msConf = config.getConfig('auth.microsoft') as AuthMicrosoftOptions;

  msConf.redirectUri = msConf?.redirectUri || window.location.href;
  msConf.authority =
    msConf?.authority || 'https://login.microsoftonline.com/organizations';

  const myMsalObj = new PublicClientApplication({
    auth: msConf,
    cache: {
      cacheLocation: 'sessionStorage'
    }
  });

  return myMsalObj;
}

export function MSALConfigFactoryb2c(
  config: ConfigService
): PublicClientApplication {
  const msConf = config.getConfig(
    'auth.microsoftb2c.browserAuthOptions'
  ) as BrowserAuthOptions;
  msConf.redirectUri = msConf?.redirectUri || window.location.href;
  msConf.authority =
    msConf?.authority || 'https://login.microsoftonline.com/organizations';

  const myMsalObj = new PublicClientApplication({
    auth: msConf,
    cache: {
      cacheLocation: 'sessionStorage'
    }
  });

  return myMsalObj;
}

export function MSALAngularConfigFactory(
  config: ConfigService
): MSPMsalGuardConfiguration {
  const msConf = config.getConfig('auth.microsoft') as AuthMicrosoftOptions;

  return {
    interactionType: InteractionType.Popup,
    authRequest: {
      scopes: ['user.read'],
      loginHint: 'todo'
    },
    type: 'add'
  };
}

export function MSALAngularConfigFactoryb2c(
  config: ConfigService
): MSPMsalGuardConfiguration {
  const msConf = config.getConfig(
    'auth.microsoftb2c.browserAuthOptions'
  ) as BrowserAuthOptions;

  return {
    interactionType: InteractionType.Popup,
    authRequest: {
      scopes: [msConf?.clientId]
    },
    type: 'b2c'
  };
}

export function provideAuthMicrosoft(type?: string) {
  if (type === 'b2c') {
    return [
      {
        provide: MSAL_INSTANCE,
        useFactory: MSALConfigFactoryb2c,
        deps: [ConfigService]
      },
      {
        provide: MSAL_GUARD_CONFIG,
        useFactory: MSALAngularConfigFactoryb2c,
        deps: [ConfigService],
        multi: true
      },
      MsalServiceb2c
    ];
  } else {
    return [
      {
        provide: MSAL_INSTANCE,
        useFactory: MSALConfigFactory,
        deps: [ConfigService]
      },
      {
        provide: MSAL_GUARD_CONFIG,
        useFactory: MSALAngularConfigFactory,
        deps: [ConfigService],
        multi: true
      },
      MsalService
    ];
  }
}
