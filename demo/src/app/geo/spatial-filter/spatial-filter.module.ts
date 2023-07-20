import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';

import { IgoPanelModule, IgoFormModule } from '@igo2/common';
import { IgoMapModule, IgoFilterModule, IgoQueryModule, IgoFeatureModule, IgoFeatureDetailsModule } from '@igo2/geo';
import { IgoMessageModule } from '@igo2/core';

import { AppSpatialFilterComponent } from './spatial-filter.component';
import { AppSpatialFilterRoutingModule } from './spatial-filter-routing.module';

@NgModule({
  declarations: [AppSpatialFilterComponent],
  imports: [
    AppSpatialFilterRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    IgoPanelModule,
    IgoMapModule,
    IgoMessageModule,
    IgoQueryModule,
    IgoFeatureModule,
    IgoFeatureDetailsModule,
    IgoFilterModule,
    IgoFormModule,
    CommonModule
  ],
  exports: [AppSpatialFilterComponent]
})
export class AppSpatialFilterModule {}
