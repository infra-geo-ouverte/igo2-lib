import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { IgoCoreModule, LanguageLoader, provideLanguageLoader } from '../lib';

export function translateLoader(http: HttpClient) {
  return new LanguageLoader(http, './base/src/demo-app/assets/locale/', '.json');
}

@NgModule({
  imports: [
    IgoCoreModule.forRoot()
  ],
  providers: [
    provideLanguageLoader(translateLoader)
  ]
})
export class IgoTestModule { }
