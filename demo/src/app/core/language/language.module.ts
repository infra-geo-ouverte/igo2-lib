import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

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
