import { AuthFeature, AuthFeatureKind, AuthService } from '@igo2/auth';
import { ConfigService } from '@igo2/core/config';

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
import { BrowserAuthOptions } from '@azure/msal-browser';

import { AuthMicrosoftComponent } from './auth-microsoft/auth-microsoft.component';
import { AuthMicrosoftb2cComponent } from './auth-microsoftb2c/auth-microsoftb2c.component';
import { MsalServiceb2c } from './auth-microsoftb2c/auth-msalServiceb2c.service';
import {
  AuthMicrosoftOptions,
  MsalGuardConfigurationWithType
} from './shared/auth-microsoft.interface';
import { AuthMsalService } from './shared/auth-msal.service';

export const AUTH_MICROSOFT_DIRECTIVES = [
  AuthMicrosoftComponent,
  AuthMicrosoftb2cComponent
] as const;

export function MSALConfigFactory(
  config: ConfigService
): IPublicClientApplication | undefined {
  const msConf = config.getConfig('auth.microsoft') as AuthMicrosoftOptions;
  if (!msConf) {
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

export function MSALConfigFactoryb2c(
  config: ConfigService
): PublicClientApplication | undefined {
  const msConf = config.getConfig(
    'auth.microsoftb2c.browserAuthOptions'
  ) as BrowserAuthOptions;
  if (!msConf) {
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

export function MSALAngularConfigFactory(
  config: ConfigService
): MsalGuardConfigurationWithType {
  const msConf = config.getConfig('auth.microsoft') as AuthMicrosoftOptions;

  return {
    interactionType: InteractionType.Popup,
    authRequest: {
      scopes: ['user.read'],
      domainHint: msConf?.domainHint || ''
    },
    type: 'add'
  };
}

export function MSALAngularConfigFactoryb2c(
  config: ConfigService
): MsalGuardConfigurationWithType {
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
      ]
    };
  } else {
    return {
      kind: AuthFeatureKind.Microsoft,
      providers: [
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
        MsalService,
        {
          provide: AuthService,
          useFactory: serviceFactory,
          deps: [ConfigService]
        }
      ]
    };
  }
}

export type IMsalServiceFactory = (config: ConfigService) => AuthService;

const msalServiceFactory: IMsalServiceFactory = (config: ConfigService) => {
  const msConf = config.getConfig('auth.microsoft') as AuthMicrosoftOptions;

  if (!msConf) {
    return new AuthService();
  }

  return new AuthMsalService();
};
