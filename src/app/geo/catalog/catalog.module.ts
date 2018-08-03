import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatTooltipModule
} from '@angular/material';

import { IgoPanelModule } from '@igo2/common';
import { IgoMapModule, IgoCatalogModule } from '@igo2/geo';

import { AppCatalogComponent } from './catalog.component';
import { AppCatalogRoutingModule } from './catalog-routing.module';

@NgModule({
  declarations: [AppCatalogComponent],
  imports: [
    CommonModule,
    AppCatalogRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    IgoPanelModule,
    IgoMapModule,
    IgoCatalogModule
  ],
  exports: [AppCatalogComponent]
})
export class AppCatalogModule {}
