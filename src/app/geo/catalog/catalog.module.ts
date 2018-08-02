import { NgModule } from '@angular/core';
import { MatCardModule, MatButtonModule } from '@angular/material';

import { IgoPanelModule } from '@igo2/common';
import { IgoMapModule, IgoCatalogModule } from '@igo2/geo';

import { AppCatalogComponent } from './catalog.component';
import { AppCatalogRoutingModule } from './catalog-routing.module';

@NgModule({
  declarations: [AppCatalogComponent],
  imports: [
    AppCatalogRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoPanelModule,
    IgoMapModule,
    IgoCatalogModule
  ],
  exports: [AppCatalogComponent]
})
export class AppCatalogModule {}
