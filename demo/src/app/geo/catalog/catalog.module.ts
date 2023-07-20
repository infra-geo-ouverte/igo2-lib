import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
