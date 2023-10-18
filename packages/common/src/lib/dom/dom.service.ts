import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { DOMOptions, DOMValue } from './dom.interfaces';

@Injectable({
  providedIn: 'root'
})
export class DOMService {
  constructor(private http: HttpClient) {}

  async getDom(dom: DOMOptions): Promise<DOMValue[]> {
    const url = dom.url;
    let result: DOMValue[];

    await this.http
      .get<any>(url)
      .pipe(
        map((response) => {
          result = response;
          return response;
        }),
        catchError((err: HttpErrorResponse) => {
          return throwError(err);
        })
      )
      .toPromise();

    return result;
  }
}
