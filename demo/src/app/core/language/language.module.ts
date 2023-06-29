import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

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
