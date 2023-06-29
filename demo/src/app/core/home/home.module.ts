import { NgModule } from '@angular/core';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

import { AppHomeComponent } from './home.component';
import { AppHomeRoutingModule } from './home-routing.module';
import { IgoInteractiveTourModule } from '@igo2/common';

@NgModule({
  declarations: [AppHomeComponent],
  imports: [
    AppHomeRoutingModule,
    IgoInteractiveTourModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [AppHomeComponent]
})
export class AppHomeModule {}
