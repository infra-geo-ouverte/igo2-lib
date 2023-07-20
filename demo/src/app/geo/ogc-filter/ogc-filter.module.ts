import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';

import { IgoPanelModule } from '@igo2/common';
import { IgoMapModule, IgoFilterModule } from '@igo2/geo';

import { AppOgcFilterComponent } from './ogc-filter.component';
import { AppOgcFilterRoutingModule } from './ogc-filter-routing.module';

@NgModule({
  declarations: [AppOgcFilterComponent],
  imports: [
    AppOgcFilterRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    IgoPanelModule,
    IgoMapModule,
    IgoFilterModule
  ],
  exports: [AppOgcFilterComponent]
})
export class AppOgcFilterModule {}
