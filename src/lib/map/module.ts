import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { MapService } from './shared';
import { MapBrowserComponent, MapBrowserBindingDirective } from './map-browser';
import { ZoomComponent } from './zoom';
import { GeolocateComponent } from './geolocate';
import { BookmarkComponent, BookmarkDialogComponent } from './bookmark';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    MapBrowserComponent,
    MapBrowserBindingDirective,
    ZoomComponent,
    GeolocateComponent,
    BookmarkComponent
  ],
  declarations: [
    MapBrowserComponent,
    MapBrowserBindingDirective,
    ZoomComponent,
    GeolocateComponent,
    BookmarkComponent,
    BookmarkDialogComponent
  ],
  entryComponents: [
    BookmarkDialogComponent
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
export * from './geolocate';
export * from './bookmark';
export * from './shared';
