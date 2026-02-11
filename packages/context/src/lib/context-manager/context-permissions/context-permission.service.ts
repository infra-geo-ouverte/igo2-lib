import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';

import { Observable, catchError } from 'rxjs';

import { IAnyContextPermission } from './context-permission.interface';

@Injectable({
  providedIn: 'root'
})
export class ContextPermissionService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private languageService = inject(LanguageService);
  private messageService = inject(MessageService);
  private baseUrl: string;

  constructor() {
    const options = this.config.getConfig('context');
    this.baseUrl = options.url ?? '';
  }

  getAll(id: number): Observable<IAnyContextPermission[]> {
    const url = this.baseUrl + '/contexts/' + id + '/permissions';
    return this.http.get<IAnyContextPermission[]>(url);
  }

  add(
    contextId: number,
    permission: IAnyContextPermission
  ): Observable<IAnyContextPermission> {
    const url = `${this.baseUrl}/contexts/${contextId}/permissions`;

    return this.http.post<IAnyContextPermission>(url, permission).pipe(
      catchError((res) => {
        this.handleError(res, true);
        throw res;
      })
    );
  }

  delete(contextId: number, permissionId: number): Observable<void> {
    const url = `${this.baseUrl}/contexts/${contextId}/permissions/${permissionId}`;
    return this.http.delete<void>(url);
  }

  private handleError(error: HttpErrorResponse, permissionError?: boolean) {
    error.error.toDisplay = true;

    if (permissionError) {
      error.error.title = this.languageService.translate.instant(
        'igo.context.contextManager.errors.addPermissionTitle'
      );
      error.error.message = this.languageService.translate.instant(
        'igo.context.contextManager.errors.addPermission'
      );
    }
    this.messageService.error(
      'igo.context.contextManager.errors.addPermission',
      'igo.context.contextManager.errors.addPermissionTitle'
    );
  }
}
