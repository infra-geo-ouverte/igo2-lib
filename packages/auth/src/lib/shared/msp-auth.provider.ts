import { HttpClient } from '@angular/common/http';
import { Injector } from '@angular/core';
import { Router } from '@angular/router';

import { ConfigService, LanguageService, MessageService } from '@igo2/core';
import { CookieUtils } from '@igo2/utils';

import { MsalService } from '@azure/msal-angular';

import { IMsalServiceFactory } from './auth-microsoft.provider';
import { AuthMsalService } from './auth-msal.service';
import { AuthType } from './auth-type.enum';
import { MspAuthExtranetOptions } from './auth.interface';
import { AuthMicrosoftOptions } from './auth.interface';
import { MSPMsalGuardConfiguration } from './auth.interface';
import { AuthService } from './auth.service';
import { MspAuthExtranetService } from './msp-auth-extranet.service';
import { TokenService } from './token.service';

export const mspMsalServiceFactory: IMsalServiceFactory = (
  http: HttpClient,
  tokenService: TokenService,
  config: ConfigService,
  languageService: LanguageService,
  messageService: MessageService,
  router: Router,
  injector: Injector,
  msalGuardConfig: MSPMsalGuardConfiguration[]
) => {
  const type = getAuthType(config);
  switch (type) {
    case AuthType.MicrosoftIntranet:
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
    case AuthType.MspExtranet:
      return new MspAuthExtranetService(
        http,
        tokenService,
        config,
        languageService,
        messageService,
        router
      );
    default:
      return new AuthService(
        http,
        tokenService,
        config,
        languageService,
        messageService,
        router
      );
  }
};

function getAuthType(config: ConfigService): AuthType {
  const microsoftIntranetConf = config.getConfig(
    'auth.microsoft'
  ) as AuthMicrosoftOptions;
  const mspExtranetConf = config.getConfig(
    'auth.mspextranet'
  ) as MspAuthExtranetOptions;

  const microsoftIntranetEnabled = microsoftIntranetConf?.enabled || false;
  const mspExtranetEnabled = mspExtranetConf?.enabled || false;

  if (microsoftIntranetEnabled && mspExtranetEnabled) {
    const contextCookieName = mspExtranetConf.contextCookieName;
    if (
      contextCookieName &&
      CookieUtils.getValue(contextCookieName) === 'intranet'
    ) {
      return AuthType.MicrosoftIntranet;
    } else {
      return AuthType.MspExtranet;
    }
  } else if (microsoftIntranetEnabled) {
    return AuthType.MicrosoftIntranet;
  } else if (mspExtranetEnabled) {
    return AuthType.MspExtranet;
  } else {
    return AuthType.Intern;
  }
}
