import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoConfirmDialogModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { BaseLayersSwitcherComponent } from './baselayers-switcher/baselayers-switcher.component';
import { MiniBaseMapComponent } from './baselayers-switcher/mini-basemap.component';
import { GeolocateButtonComponent } from './geolocate-button/geolocate-button.component';
import { HomeExtentButtonComponent } from './home-extent-button/home-extent-button.component';
import { InfoSectionComponent } from './info-section/info-section.component';
import { MapBrowserComponent } from './map-browser/map-browser.component';
import { MapCenterComponent } from './map-center/map-center.component';
import { MenuButtonComponent } from './menu-button/menu-button.component';
import { OfflineButtonComponent } from './offline-button/offline-button.component';
import { RotationButtonComponent } from './rotation-button/rotation-button.component';
import { HoverFeatureDirective } from './shared/hover-feature.directive';
import { PointerPositionDirective } from './shared/map-pointer-position.directive';
import { MapOfflineDirective } from './shared/mapOffline.directive';
import { SwipeControlComponent } from './swipe-control/swipe-control.component';
import { WakeLockButtonComponent } from './wake-lock-button/wake-lock-button.component';
import { ZoomButtonComponent } from './zoom-button/zoom-button.component';

const directives = [
  MapBrowserComponent,
  ZoomButtonComponent,
  GeolocateButtonComponent,
  HomeExtentButtonComponent,
  RotationButtonComponent,
  InfoSectionComponent,
  BaseLayersSwitcherComponent,
  MiniBaseMapComponent,
  MapOfflineDirective,
  OfflineButtonComponent,
  WakeLockButtonComponent,
  PointerPositionDirective,
  HoverFeatureDirective,
  SwipeControlComponent,
  MapCenterComponent,
  MenuButtonComponent
];

@NgModule({
  imports: [
    CommonModule,
    IgoLanguageModule,
    IgoConfirmDialogModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  declarations: directives,
  exports: directives
})
export class IgoMapModule {}
