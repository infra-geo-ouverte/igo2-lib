import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { IgoLanguageModule } from '../src/language';

import 'rxjs/add/operator/debounceTime.js';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';

import 'openlayers';

@NgModule({
  imports: [
    TranslateModule.forRoot(),
    IgoLanguageModule.forRoot()
  ],
  exports: [
    TranslateModule
  ]
})
export class IgoTestModule { }
