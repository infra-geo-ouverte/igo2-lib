import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoSharedModule } from '../shared';

import { CapabilitiesService, LayerService } from './shared';
import { LayerItemComponent } from './layer-item';
import { LayerLegendComponent } from './layer-legend';
import { LayerListComponent } from './layer-list';

@NgModule({
  imports: [
    CommonModule,
    IgoSharedModule
  ],
  exports: [
    LayerItemComponent,
    LayerLegendComponent,
    LayerListComponent
  ],
  declarations: [
    LayerItemComponent,
    LayerLegendComponent,
    LayerListComponent
  ],
  providers: [
    LayerService
  ]
})
export class IgoLayerModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoLayerModule,
      providers: [
        LayerService,
        CapabilitiesService
      ]
    };
  }
}

export * from './shared';
export * from './layer-item';
export * from './layer-legend';
export * from './layer-list';
