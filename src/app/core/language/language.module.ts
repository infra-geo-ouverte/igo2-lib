import { NgModule } from '@angular/core';
import { MatCardModule, MatButtonModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { AppLanguageComponent } from './language.component';
import { AppLanguageRoutingModule } from './language-routing.module';

@NgModule({
  declarations: [AppLanguageComponent],
  imports: [
    AppLanguageRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoLanguageModule.forRoot()
  ],
  exports: [AppLanguageComponent]
})
export class AppLanguageModule {}
