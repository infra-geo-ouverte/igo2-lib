import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';

import { IgoPanelModule, IgoEntityTableModule } from '@igo2/common';
import { IgoMapModule, IgoFeatureModule } from '@igo2/geo';

import { AppFeatureComponent } from './feature.component';
import { AppFeatureRoutingModule } from './feature-routing.module';

@NgModule({
  declarations: [AppFeatureComponent],
  imports: [
    AppFeatureRoutingModule,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    IgoPanelModule,
    IgoEntityTableModule,
    IgoMapModule,
    IgoFeatureModule
  ],
  exports: [AppFeatureComponent]
})
export class AppFeatureModule {}
