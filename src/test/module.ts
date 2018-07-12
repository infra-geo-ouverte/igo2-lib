import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  IgoCoreModule,
  LanguageLoader,
  provideLanguageLoader,
  provideConfigOptions
} from '../lib';

export function translateLoader(http: HttpClient) {
  return new LanguageLoader(
    http,
    './base/src/demo-app/assets/locale/',
    '.json'
  );
}

@NgModule({
  imports: [IgoCoreModule.forRoot()],
  providers: [
    provideLanguageLoader(translateLoader),
    provideConfigOptions({
      default: {
        context: {
          basePath: './base/src/demo-app/contexts'
        }
      }
    })
  ]
})
export class IgoTestModule {}
