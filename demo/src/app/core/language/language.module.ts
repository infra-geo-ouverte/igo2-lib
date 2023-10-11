import { NgModule } from '@angular/core';

import { IgoLanguageModule } from '@igo2/core';

import { SharedModule } from '../../shared/shared.module';
import { AppLanguageRoutingModule } from './language-routing.module';
import { AppLanguageComponent } from './language.component';

@NgModule({
  declarations: [AppLanguageComponent],
  imports: [
    AppLanguageRoutingModule,
    SharedModule,
    IgoLanguageModule.forRoot()
  ],
  exports: [AppLanguageComponent]
})
export class AppLanguageModule {}
