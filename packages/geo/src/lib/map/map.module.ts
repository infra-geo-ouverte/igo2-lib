import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { HoverFeatureDirective } from './shared/hover-feature.directive';
import { SwipeControlComponent } from './swipe-control/swipe-control.component';
import { MapCenterComponent } from './map-center/map-center.component';
import { MenuButtonComponent } from './menu-button/menu-button.component';
import { HomeButtonComponent } from './home-button/home-button.component';

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
    HoverFeatureDirective,
    SwipeControlComponent,
    MapCenterComponent,
    MenuButtonComponent,
    HomeButtonComponent
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
    HoverFeatureDirective,
    SwipeControlComponent,
    MapCenterComponent,
    MenuButtonComponent,
    HomeButtonComponent
  ]
})
export class IgoMapModule {}
