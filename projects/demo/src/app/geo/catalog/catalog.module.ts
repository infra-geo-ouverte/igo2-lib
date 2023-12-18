import { NgModule } from '@angular/core';

import { IgoPanelModule } from '@igo2/common';
import { IgoConfigModule, provideConfigOptions } from '@igo2/core';
import { IgoCatalogModule, IgoMapModule } from '@igo2/geo';

import { environment } from '../../../environments/environment';
import { SharedModule } from '../../shared/shared.module';
import { AppCatalogRoutingModule } from './catalog-routing.module';
import { AppCatalogComponent } from './catalog.component';

@NgModule({
  imports: [
    SharedModule,
    AppCatalogRoutingModule,
    IgoConfigModule,
    IgoPanelModule,
    IgoMapModule,
    IgoCatalogModule,
    AppCatalogComponent
  ],
  exports: [AppCatalogComponent],
  providers: [
    provideConfigOptions({
      default: environment.igo
    })
  ]
})
export class AppCatalogModule {}
