import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { MapService } from './shared';
import { MapBrowserComponent } from './map-browser';
import { ZoomComponent } from './zoom';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    MapBrowserComponent,
    ZoomComponent
  ],
  declarations: [
    MapBrowserComponent,
    ZoomComponent
  ]
})
export class IgoMapModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoMapModule,
      providers: [
        MapService
      ]
    };
  }
}

export * from './map-browser';
export * from './zoom';
export * from './shared';
