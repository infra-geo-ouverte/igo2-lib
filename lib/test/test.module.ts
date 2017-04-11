import { NgModule } from '@angular/core';
import { TranslateModule, TranslateLoader,
         TranslateStaticLoader } from 'ng2-translate';
import { Http } from '@angular/http';

import { IgoLanguageModule } from './language';

import 'rxjs/add/operator/debounceTime.js';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';

import 'openlayers';


export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, 'base/assets/locale', '.json');
}

@NgModule({
  imports: [
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: createTranslateLoader,
      deps: [Http]
    }),
    IgoLanguageModule.forRoot()
  ],
  exports: [
    TranslateModule
  ]
})
export class IgoTestModule { }
