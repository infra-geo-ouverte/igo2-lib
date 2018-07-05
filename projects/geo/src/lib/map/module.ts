import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  MatIconModule,
  MatButtonModule,
  MatSelectModule,
  MatOptionModule,
  MatTooltipModule,
  MatFormFieldModule
} from '@angular/material';

import { IgoCoreModule } from '@igo2/core';
import { IgoCommonModule } from '@igo2/common';

import { MapBrowserComponent, MapBrowserBindingDirective } from './map-browser';
import { ZoomButtonComponent } from './zoom-button';
import { GeolocateButtonComponent } from './geolocate-button';
import {
  BookmarkButtonComponent,
  BookmarkDialogComponent
} from './bookmark-button';
import {
  PoiButtonComponent,
  PoiDialogComponent,
  PoiService
} from './poi-button';
import { UserButtonComponent, UserDialogComponent } from './user-button';
import {
  BaseLayersSwitcherComponent,
  MiniBaseMapComponent
} from './baselayers-switcher';

@NgModule({
  imports: [
    IgoCoreModule,
    IgoCommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule,
    MatFormFieldModule
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
  ],
  providers: [PoiService]
})
export class IgoMapModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoMapModule
    };
  }
}
