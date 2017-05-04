import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { MapService } from './shared';
import { MapBrowserComponent, MapBrowserBindingDirective } from './map-browser';
import { ZoomComponent } from './zoom';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    MapBrowserComponent,
    MapBrowserBindingDirective,
    ZoomComponent
  ],
  declarations: [
    MapBrowserComponent,
    MapBrowserBindingDirective,
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
