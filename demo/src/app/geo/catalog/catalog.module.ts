import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoConfigModule, provideConfigOptions } from '@igo2/core';
import { IgoPanelModule } from '@igo2/common';
import { IgoMapModule, IgoCatalogModule } from '@igo2/geo';

import { environment } from '../../../environments/environment';
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
    IgoConfigModule,
    IgoPanelModule,
    IgoMapModule,
    IgoCatalogModule
  ],
  exports: [AppCatalogComponent],
  providers: [
    provideConfigOptions({
      default: environment.igo
    })
  ]
})
export class AppCatalogModule {}
