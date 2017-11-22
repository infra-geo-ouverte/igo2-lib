import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { MapService } from './shared';
import { MapBrowserComponent, MapBrowserBindingDirective } from './map-browser';
import { ZoomButtonComponent } from './zoom-button';
import { GeolocateButtonComponent } from './geolocate-button';
import { BookmarkButtonComponent, BookmarkDialogComponent } from './bookmark-button';
import { PoiButtonComponent, PoiDialogComponent } from './poi-button';
import { UserButtonComponent, UserDialogComponent } from './user-button';
import { BaseLayersSwitcherComponent, MiniBaseMapComponent } from './baselayers-switcher';

@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    MapBrowserComponent,
    MapBrowserBindingDirective,
    ZoomButtonComponent,
    GeolocateButtonComponent,
    BookmarkButtonComponent,
    PoiButtonComponent,
    UserButtonComponent,
    BaseLayersSwitcherComponent
  ],
  declarations: [
    MapBrowserComponent,
    MapBrowserBindingDirective,
    ZoomButtonComponent,
    GeolocateButtonComponent,
    BookmarkButtonComponent,
    BookmarkDialogComponent,
    PoiButtonComponent,
    PoiDialogComponent,
    UserButtonComponent,
    UserDialogComponent,
    BaseLayersSwitcherComponent,
    MiniBaseMapComponent
  ],
  entryComponents: [
    BookmarkDialogComponent,
    PoiDialogComponent,
    UserDialogComponent
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
export * from './zoom-button';
export * from './geolocate-button';
export * from './bookmark-button';
export * from './poi-button';
export * from './user-button';
export * from './baselayers-switcher';
export * from './shared';
