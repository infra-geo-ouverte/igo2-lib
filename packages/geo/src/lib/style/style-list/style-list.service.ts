import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ObjectUtils } from '@igo2/utils';

import { StyleListOptions } from './style-list.interface';

@Injectable({
  providedIn: 'root'
})
export class StyleListService {
  private styleList: object = {};

  constructor(private injector: Injector) {}

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

    const http = this.injector.get(HttpClient);

    return new Promise((resolve, _reject) => {
      http
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
