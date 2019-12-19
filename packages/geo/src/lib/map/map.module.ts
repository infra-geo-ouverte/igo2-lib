import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatIconModule,
  MatButtonModule,
  MatTooltipModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoConfirmDialogModule } from '@igo2/common';

import { MapBrowserComponent } from './map-browser/map-browser.component';
import { ZoomButtonComponent } from './zoom-button/zoom-button.component';
import { GeolocateButtonComponent } from './geolocate-button/geolocate-button.component';
import { RotationButtonComponent } from './rotation-button/rotation-button.component';
import { BaseLayersSwitcherComponent } from './baselayers-switcher/baselayers-switcher.component';
import { MiniBaseMapComponent } from './baselayers-switcher/mini-basemap.component';
import { MapOfflineDirective } from './shared/mapOffline.directive';
import { OfflineButtonComponent } from './offline-button/offline-button.component';
import { PointerPositionDirective } from './shared/map-pointer-position.directive';
import { PointerPositionByKeyDirective } from './shared/map-pointer-position-by-key.directive';

@NgModule({
  imports: [
    CommonModule,
    IgoLanguageModule,
    IgoConfirmDialogModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  exports: [
    MapBrowserComponent,
    ZoomButtonComponent,
    GeolocateButtonComponent,
    RotationButtonComponent,
    BaseLayersSwitcherComponent,
    MiniBaseMapComponent,
    MapOfflineDirective,
    OfflineButtonComponent,
    PointerPositionDirective,
    PointerPositionByKeyDirective
  ],
  declarations: [
    MapBrowserComponent,
    ZoomButtonComponent,
    GeolocateButtonComponent,
    RotationButtonComponent,
    BaseLayersSwitcherComponent,
    MiniBaseMapComponent,
    MapOfflineDirective,
    OfflineButtonComponent,
    PointerPositionDirective,
    PointerPositionByKeyDirective
  ]
})
export class IgoMapModule {}
