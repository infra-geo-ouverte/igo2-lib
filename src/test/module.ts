import { NgModule } from '@angular/core';
import { Http } from '@angular/http';

import { IgoLanguageModule, LanguageLoader, provideLanguageService } from '../lib/language';

import 'rxjs/add/operator/debounceTime.js';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';

export function translateLoader(http: Http) {
  return new LanguageLoader(http, './base/src/demo-app/assets/locale/', '.json');
}

@NgModule({
  imports: [
    IgoLanguageModule.forRoot()
  ],
  providers: [
    provideLanguageService({
      loader: translateLoader
    })
  ],
})
export class IgoTestModule { }
