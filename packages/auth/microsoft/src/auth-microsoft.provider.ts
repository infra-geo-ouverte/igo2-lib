import { inject } from '@angular/core';

import {
  AUTH_OPTIONS,
  AuthFeature,
  AuthFeatureKind,
  AuthService
} from '@igo2/auth';

import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MsalService
} from '@azure/msal-angular';
import {
  BrowserCacheLocation,
  ILoggerCallback,
  IPublicClientApplication,
  InteractionType,
  LogLevel,
  PublicClientApplication
} from '@azure/msal-browser';

import { AuthMicrosoftComponent } from './auth-microsoft/auth-microsoft.component';
import { AuthMicrosoftb2cComponent } from './auth-microsoftb2c/auth-microsoftb2c.component';
import { MsalServiceb2c } from './auth-microsoftb2c/auth-msalServiceb2c.service';
import {
  AnyMicrosoftOptions,
  MsalGuardConfigurationWithType
} from './shared/auth-microsoft.interface';
import { AuthMsalService } from './shared/auth-msal.service';

export const AUTH_MICROSOFT_DIRECTIVES = [
  AuthMicrosoftComponent,
  AuthMicrosoftb2cComponent
] as const;

export function MSALConfigFactory(): IPublicClientApplication | undefined {
  const authOptions = inject(AUTH_OPTIONS);
  const msConf = (authOptions as AnyMicrosoftOptions).microsoft;

  if (!msConf?.clientId) {
    return;
  }

  msConf.redirectUri = msConf?.redirectUri || window.location.href;
  msConf.authority =
    msConf?.authority || 'https://login.microsoftonline.com/organizations';

  const msalInstance = new PublicClientApplication({
    auth: msConf,
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage
    },
    system: {
      loggerOptions: {
        loggerCallback,
        piiLoggingEnabled: false,
        logLevel: LogLevel.Warning
      }
    }
  });

  return msalInstance;
}

const loggerCallback: ILoggerCallback = (
  level: LogLevel,
  message: string,
  containsPii: boolean
) => {
  if (containsPii) {
    return;
  }
  switch (level) {
    case LogLevel.Error:
      console.error(message);
      break;
    case LogLevel.Info:
      console.info(message);
      break;
    case LogLevel.Verbose:
      console.debug(message);
      break;
    case LogLevel.Warning:
      console.warn(message);
      break;
  }
};

export function MSALConfigFactoryb2c(): PublicClientApplication | undefined {
  const authOptions = inject(AUTH_OPTIONS);
  const msConf = (authOptions as AnyMicrosoftOptions).microsoftb2c
    ?.browserAuthOptions;
  if (!msConf?.clientId) {
    return;
  }
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

export function MSALAngularConfigFactory(): MsalGuardConfigurationWithType {
  const authOptions = inject(AUTH_OPTIONS);
  const msConf = (authOptions as AnyMicrosoftOptions).microsoft;

  return {
    interactionType: InteractionType.Popup,
    authRequest: {
      scopes: ['user.read'],
      domainHint: msConf?.domainHint || ''
    },
    type: 'add'
  };
}

export function MSALAngularConfigFactoryb2c(): MsalGuardConfigurationWithType {
  const authOptions = inject(AUTH_OPTIONS);
  const msConf = (authOptions as AnyMicrosoftOptions).microsoftb2c!
    .browserAuthOptions;

  return {
    interactionType: InteractionType.Popup,
    authRequest: {
      scopes: [msConf?.clientId]
    },
    type: 'b2c'
  };
}

export function withMicrosoftSupport(
  type?: string,
  serviceFactory: IMsalServiceFactory = msalServiceFactory
): AuthFeature<AuthFeatureKind.Microsoft> {
  if (type === 'b2c') {
    return {
      kind: AuthFeatureKind.Microsoft,
      providers: [
        {
          provide: MSAL_INSTANCE,
          useFactory: MSALConfigFactoryb2c
        },
        {
          provide: MSAL_GUARD_CONFIG,
          useFactory: MSALAngularConfigFactoryb2c,
          multi: true
        },
        MsalServiceb2c
      ]
    };
  } else {
    return {
      kind: AuthFeatureKind.Microsoft,
      providers: [
        {
          provide: MSAL_INSTANCE,
          useFactory: MSALConfigFactory
        },
        {
          provide: MSAL_GUARD_CONFIG,
          useFactory: MSALAngularConfigFactory,
          multi: true
        },
        MsalService,
        {
          provide: AuthService,
          useFactory: () => serviceFactory()
        }
      ]
    };
  }
}

export type IMsalServiceFactory = () => AuthService;

const msalServiceFactory: IMsalServiceFactory = () => {
  const authOptions = inject(AUTH_OPTIONS);
  const msConf = (authOptions as AnyMicrosoftOptions).microsoft;

  if (!msConf?.clientId) {
    return new AuthService();
  }

  return new AuthMsalService();
};
