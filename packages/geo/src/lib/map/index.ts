import {
  BaseLayersSwitcherComponent,
  MiniBaseMapComponent
} from './baselayers-switcher';
import { GeolocateButtonComponent } from './geolocate-button';
import { HomeExtentButtonComponent } from './home-extent-button';
import { InfoSectionComponent } from './info-section';
import { MapBrowserComponent } from './map-browser';
import { MapCenterComponent } from './map-center';
import { MenuButtonComponent } from './menu-button';
import { OfflineButtonComponent } from './offline-button';
import { RotationButtonComponent } from './rotation-button';
import {
  HoverFeatureDirective,
  MapOfflineDirective,
  PointerPositionDirective
} from './shared';
import { SwipeControlComponent } from './swipe-control';
import { WakeLockButtonComponent } from './wake-lock-button';
import { ZoomButtonComponent } from './zoom-button';

export * from './shared';

export * from './map-browser';
export * from './zoom-button';
export * from './menu-button';
export * from './geolocate-button';
export * from './home-extent-button';
export * from './offline-button';
export * from './wake-lock-button';
export * from './baselayers-switcher';
export * from './rotation-button';
export * from './swipe-control';
export * from './map-center';
export * from './info-section';

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
