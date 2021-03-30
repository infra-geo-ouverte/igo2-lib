import {
  MsalGuardConfiguration,
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MsalService
} from '@azure/msal-angular';
import {
  PublicClientApplication,
  InteractionType
} from '@azure/msal-browser';

import { ConfigService } from '@igo2/core';

import { BrowserAuthOptions } from '@azure/msal-browser';

import { AuthMicrosoftOptions } from './auth.interface';

export function MSALConfigFactory(config: ConfigService): PublicClientApplication {

  const msConf: BrowserAuthOptions = config.getConfig('auth.microsoft') || {};
  
  msConf.redirectUri = msConf.redirectUri || window.location.href;
  msConf.authority = msConf.authority || 'https://login.microsoftonline.com/organizations';

  const myMsalObj = new PublicClientApplication({
    auth: msConf,
    cache: {
      cacheLocation: 'sessionStorage'
    }
  });

  return myMsalObj;
}

export function MSALConfigFactoryb2c(config: ConfigService): PublicClientApplication {

  const msConf: BrowserAuthOptions = config.getConfig('auth.microsoftb2c.browserAuthOptions') || {};
  
  msConf.redirectUri = msConf.redirectUri || window.location.href;
  msConf.authority = msConf.authority || 'https://login.microsoftonline.com/organizations';

  const myMsalObj = new PublicClientApplication({
    auth: msConf,
    cache: {
      cacheLocation: 'sessionStorage'
    }
  });

  return myMsalObj;
}


export function MSALAngularConfigFactory(config: ConfigService): MsalGuardConfiguration {

  const msConf: AuthMicrosoftOptions = config.getConfig('auth.microsoft') || {};

  return {
    interactionType: InteractionType.Popup,
    authRequest: {
      scopes: ['user.read']
    }
  };
}

export function MSALAngularConfigFactoryb2c(config: ConfigService): MsalGuardConfiguration {

  const msConf: BrowserAuthOptions = config.getConfig('auth.microsoftb2c.browserAuthOptions') || {};

  return {
    interactionType: InteractionType.Popup,
    authRequest: {
      scopes: [msConf.clientId]
    }
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
        deps: [ConfigService]
      },
      MsalService
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
        deps: [ConfigService]
      },
      MsalService
    ];
  }
}
