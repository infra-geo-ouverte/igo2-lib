import { HttpClient } from '@angular/common/http';
import { Injector, Provider } from '@angular/core';
import { Router } from '@angular/router';

import {
  AuthFeature,
  AuthFeatureKind,
  AuthService,
  TokenService
} from '@igo2/auth';
import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';

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
  MSPMsalGuardConfiguration
} from './shared/auth-microsoft.interface';
import { AuthMsalService } from './shared/auth-msal.service';

export const AUTH_MICROSOFT_DIRECTIVES = [
  AuthMicrosoftComponent,
  AuthMicrosoftb2cComponent
] as const;

export function MSALConfigFactory(
  config: ConfigService
): IPublicClientApplication {
  const msConf = config.getConfig('auth.microsoft') as AuthMicrosoftOptions;
  if (!msConf) {
    return;
  }

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
): PublicClientApplication {
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

export function MSALAngularConfigFactory(): MSPMsalGuardConfiguration {
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

export function withMicrosoftSupport(
  type: 'b2c' | 'default',
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
          deps: [
            HttpClient,
            TokenService,
            ConfigService,
            LanguageService,
            MessageService,
            Router,
            Injector,
            MSAL_GUARD_CONFIG
          ]
        }
      ]
    };
  }
}

export type IMsalServiceFactory = (
  http: HttpClient,
  tokenService: TokenService,
  config: ConfigService,
  languageService: LanguageService,
  messageService: MessageService,
  router: Router,
  injector: Injector,
  msalGuardConfig: MSPMsalGuardConfiguration[]
) => AuthService;

const msalServiceFactory: IMsalServiceFactory = (
  http: HttpClient,
  tokenService: TokenService,
  config: ConfigService,
  languageService: LanguageService,
  messageService: MessageService,
  router: Router,
  injector: Injector,
  msalGuardConfig: MSPMsalGuardConfiguration[]
) => {
  const msConf = config.getConfig('auth.microsoft') as AuthMicrosoftOptions;

  if (!msConf) {
    return new AuthService(
      http,
      tokenService,
      config,
      languageService,
      messageService,
      router
    );
  }

  return new AuthMsalService(
    http,
    tokenService,
    config,
    languageService,
    messageService,
    router,
    injector.get(MsalService),
    msalGuardConfig
  );
};
