import { NgModule } from '@angular/core';

import { IgoLanguageModule } from '@igo2/core';

import { AppLanguageComponent } from './language.component';
import { AppLanguageRoutingModule } from './language-routing.module';
import { SharedModule } from '../../shared/shared.module';

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
