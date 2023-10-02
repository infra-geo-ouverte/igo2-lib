import { HttpClient } from '@angular/common/http';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core';

import { Observable } from 'rxjs';
import { Md5 } from 'ts-md5';

import { AuthByKeyOptions, WithCredentialsOptions } from './auth.interface';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  private refreshInProgress = false;
  private trustHosts: string[];
  private hostsWithCredentials: WithCredentialsOptions[];
  private hostsWithAuthByKey: AuthByKeyOptions[];

  constructor(
    private config: ConfigService,
    private tokenService: TokenService,
    private http: HttpClient
  ) {
    this.trustHosts = this.config.getConfig('auth.trustHosts') || [];
    this.trustHosts.push(window.location.hostname);

    this.hostsWithCredentials =
      this.config.getConfig('auth.hostsWithCredentials') || [];
    this.hostsWithAuthByKey = this.config.getConfig('auth.hostsByKey') || [];
  }

  intercept(
    originalReq: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const withCredentials = this.handleHostsWithCredentials(originalReq.url);
    let req = originalReq.clone();
    const hostWithKey = this.handleHostsAuthByKey(originalReq.url);
    if (hostWithKey) {
      req = req.clone({
        params: req.params.set(hostWithKey.key, hostWithKey.value)
      });
    }
    if (withCredentials) {
      req = originalReq.clone({
        withCredentials
      });
      return next.handle(req);
    }
    this.refreshToken();
    const token = this.tokenService.get();
    const element = document.createElement('a');
    element.href = req.url;
    if (element.host === '') {
      element.href = element.href; // FIX IE11, DO NOT REMOVE
    }

    if (!token || this.trustHosts.indexOf(element.hostname) === -1) {
      return next.handle(req);
    }

    const authHeader = `Bearer ${token}`;
    let authReq = req.clone({
      headers: req.headers.set('Authorization', authHeader)
    });

    const tokenDecoded: any = this.tokenService.decode();
    if (
      authReq.params.get('_i') === 'true' &&
      tokenDecoded &&
      tokenDecoded.user &&
      tokenDecoded.user.sourceId
    ) {
      const hashUser = Md5.hashStr(tokenDecoded.user.sourceId) as string;
      authReq = authReq.clone({
        params: authReq.params.set('_i', hashUser)
      });
    } else if (authReq.params.get('_i') === 'true') {
      authReq = authReq.clone({
        params: authReq.params.delete('_i')
      });
    }

    return next.handle(authReq);
  }

  interceptXhr(xhr, url: string): boolean {
    const withCredentials = this.handleHostsWithCredentials(url);
    if (withCredentials) {
      xhr.withCredentials = withCredentials;
      return true;
    }

    this.refreshToken();
    const element = document.createElement('a');
    element.href = url;

    const token = this.tokenService.get();
    if (!token || this.trustHosts.indexOf(element.hostname) === -1) {
      return false;
    }
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    return true;
  }

  alterUrlWithKeyAuth(url: string): string {
    const hostWithKey = this.handleHostsAuthByKey(url);
    let interceptedUrl = url;
    if (hostWithKey) {
      const urlDecomposed = interceptedUrl.split(/[?&]/);
      let urlWithKeyAdded = urlDecomposed.shift();
      const paramsToKeep = urlDecomposed.filter((p) => p.length !== 0);
      paramsToKeep.push(`${hostWithKey.key}=${hostWithKey.value}`);
      if (paramsToKeep.length) {
        urlWithKeyAdded += '?' + paramsToKeep.join('&');
      }
      return urlWithKeyAdded;
    }
    return;
  }

  private handleHostsWithCredentials(reqUrl: string) {
    let withCredentials = false;
    for (const hostWithCredentials of this.hostsWithCredentials) {
      const domainRegex = new RegExp(hostWithCredentials.domainRegFilters);
      if (domainRegex.test(reqUrl)) {
        withCredentials =
          hostWithCredentials.withCredentials !== undefined
            ? hostWithCredentials.withCredentials
            : undefined;
        break;
      }
    }
    return withCredentials;
  }

  private handleHostsAuthByKey(reqUrl: string): { key: string; value: string } {
    let hostWithKey;
    for (const hostWithAuthByKey of this.hostsWithAuthByKey) {
      const domainRegex = new RegExp(hostWithAuthByKey.domainRegFilters);
      if (domainRegex.test(reqUrl)) {
        var replace = `${hostWithAuthByKey.keyProperty}=${hostWithAuthByKey.keyValue}`;
        var keyAdded = new RegExp(replace, 'gm');
        if (!keyAdded.test(reqUrl)) {
          hostWithKey = {
            key: hostWithAuthByKey.keyProperty,
            value: hostWithAuthByKey.keyValue
          };
          break;
        }
      }
    }
    return hostWithKey;
  }

  refreshToken() {
    const jwt = this.tokenService.decode();
    const currentTime = new Date().getTime() / 1000;

    if (
      !this.refreshInProgress &&
      jwt &&
      currentTime < jwt.exp &&
      currentTime > jwt.exp - 1800
    ) {
      this.refreshInProgress = true;

      const url = this.config.getConfig('auth.url');
      return this.http.post(`${url}/refresh`, {}).subscribe(
        (data: any) => {
          this.tokenService.set(data.token);
          this.refreshInProgress = false;
        },
        (err) => {
          err.error.caught = true;
          return err;
        }
      );
    }
  }
}
