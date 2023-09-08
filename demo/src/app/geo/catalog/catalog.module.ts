import { NgModule } from '@angular/core';

import { IgoConfigModule, provideConfigOptions } from '@igo2/core';
import { IgoPanelModule } from '@igo2/common';
import { IgoMapModule, IgoCatalogModule } from '@igo2/geo';

import { environment } from '../../../environments/environment';
import { AppCatalogComponent } from './catalog.component';
import { AppCatalogRoutingModule } from './catalog-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppCatalogComponent],
  imports: [
    SharedModule,
    AppCatalogRoutingModule,
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
