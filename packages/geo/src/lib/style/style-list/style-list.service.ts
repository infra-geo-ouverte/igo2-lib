import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ObjectUtils } from '@igo2/utils';

import { StyleListOptions } from './style-list.interface';

@Injectable({
  providedIn: 'root'
})
export class StyleListService {
  private styleList: object = {};
  private httpClient: HttpClient;

  constructor(handler: HttpBackend) {
    this.httpClient = new HttpClient(handler);
  }

  /**
   * Use to get the data found in styleList file
   */
  public getStyleList(key: string): any {
    return ObjectUtils.resolve(this.styleList, key);
  }

  /**
   * This method loads "[path]" to get all styleList's variables
   */
  public load(options: StyleListOptions) {
    const baseStyleList = options.default || {};
    if (!options.path) {
      this.styleList = baseStyleList;
      return true;
    }

    return new Promise((resolve, _reject) => {
      this.httpClient
        .get(options.path)
        .pipe(
          catchError((error: any): any => {
            console.log(`StyleList file ${options.path} could not be read`);
            resolve(true);
            return throwError(error.error || 'Server error');
          })
        )
        .subscribe((styleListResponse: object) => {
          this.styleList = ObjectUtils.mergeDeep(baseStyleList, styleListResponse);
          resolve(true);
        });
    });
  }
}
