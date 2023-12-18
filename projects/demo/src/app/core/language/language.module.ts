import { NgModule } from '@angular/core';

import { IgoLanguageModule } from '@igo2/core';


import { AppLanguageRoutingModule } from './language-routing.module';
import { AppLanguageComponent } from './language.component';

@NgModule({
  imports: [
    AppLanguageRoutingModule,
    IgoLanguageModule.forRoot(),
    AppLanguageComponent
],
  exports: [AppLanguageComponent]
})
export class AppLanguageModule {}
