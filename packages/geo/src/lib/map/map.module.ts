import { NgModule } from '@angular/core';

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

export const MAP_DIRECTIVES = [
  BaseLayersSwitcherComponent,
  GeolocateButtonComponent,
  HomeExtentButtonComponent,
  HoverFeatureDirective,
  InfoSectionComponent,
  MapBrowserComponent,
  MapCenterComponent,
  MapOfflineDirective,
  MenuButtonComponent,
  MiniBaseMapComponent,
  OfflineButtonComponent,
  PointerPositionDirective,
  RotationButtonComponent,
  SwipeControlComponent,
  WakeLockButtonComponent,
  ZoomButtonComponent
] as const;

/**
 * @deprecated import the components directly or the MAP_DIRECTIVES for the set
 */
@NgModule({
  imports: [...MAP_DIRECTIVES],
  exports: [...MAP_DIRECTIVES]
})
export class IgoMapModule {}
