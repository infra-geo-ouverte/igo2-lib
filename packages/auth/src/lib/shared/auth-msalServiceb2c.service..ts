/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Inject, Injectable } from '@angular/core';
import { Location } from '@angular/common';
import {
  IPublicClientApplication,
  EndSessionRequest,
  EndSessionPopupRequest,
  AuthenticationResult,
  RedirectRequest,
  SilentRequest,
  PopupRequest,
  SsoSilentRequest,
  Logger,
  WrapperSKU
} from '@azure/msal-browser';
import { MSAL_INSTANCE } from '@azure/msal-angular';
import { Observable, from } from 'rxjs';
import { IMsalService } from '@azure/msal-angular';

@Injectable()
export class MsalServiceb2c implements IMsalService {
  private redirectHash: string;
  private logger: Logger;
  private name = '@azure/msal-angular';
  private version = '2.0.0-beta.2';
  constructor(
    @Inject(MSAL_INSTANCE) public instance: IPublicClientApplication,
    private location: Location
  ) {
    const hash = this.location.path(true).split('#').pop();
    if (hash) {
      this.redirectHash = `#${hash}`;
    }
    this.instance.initializeWrapperLibrary(WrapperSKU.Angular, this.version);
  }

  initialize(): Observable<void> {
    return from(this.instance.initialize());
  }

  acquireTokenPopup(request: PopupRequest): Observable<AuthenticationResult> {
    return from(this.instance.acquireTokenPopup(request));
  }
  acquireTokenRedirect(request: RedirectRequest): Observable<void> {
    return from(this.instance.acquireTokenRedirect(request));
  }
  acquireTokenSilent(
    silentRequest: SilentRequest
  ): Observable<AuthenticationResult> {
    return from(this.instance.acquireTokenSilent(silentRequest));
  }
  handleRedirectObservable(hash?: string): Observable<AuthenticationResult> {
    return from(this.instance.handleRedirectPromise(hash || this.redirectHash));
  }
  loginPopup(request?: PopupRequest): Observable<AuthenticationResult> {
    return from(this.instance.loginPopup(request));
  }
  loginRedirect(request?: RedirectRequest): Observable<void> {
    return from(this.instance.loginRedirect(request));
  }
  logout(logoutRequest?: EndSessionRequest): Observable<void> {
    return from(this.instance.logout(logoutRequest));
  }
  logoutRedirect(logoutRequest?: EndSessionRequest): Observable<void> {
    return from(this.instance.logoutRedirect(logoutRequest));
  }
  logoutPopup(logoutRequest?: EndSessionPopupRequest): Observable<void> {
    return from(this.instance.logoutPopup(logoutRequest));
  }
  ssoSilent(request: SsoSilentRequest): Observable<AuthenticationResult> {
    return from(this.instance.ssoSilent(request));
  }
  /**
   * Gets logger for msal-angular.
   * If no logger set, returns logger instance created with same options as msal-browser
   */
  getLogger(): Logger {
    if (!this.logger) {
      this.logger = this.instance.getLogger().clone(this.name, this.version);
    }
    return this.logger;
  }
  // Create a logger instance for msal-angular with the same options as msal-browser
  setLogger(logger: Logger): void {
    this.logger = logger.clone(this.name, this.version);
    this.instance.setLogger(logger);
  }
}
