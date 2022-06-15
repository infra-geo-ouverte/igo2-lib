import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { IgoPanelModule, IgoEntityTableModule } from '@igo2/common';
import { IgoMapModule, IgoFeatureModule } from '@igo2/geo';

import { AppSimpleListComponent } from './simple-list.component';
import { AppSimpleListRoutingModule } from './simple-list-routing.module';

@NgModule({
  declarations: [AppSimpleListComponent],
  imports: [
    AppSimpleListRoutingModule,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    IgoPanelModule,
    IgoEntityTableModule,
    IgoMapModule,
    IgoFeatureModule
  ],
  exports: [AppSimpleListComponent]
})
export class AppSimpleListModule {}
