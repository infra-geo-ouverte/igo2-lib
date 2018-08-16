import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatIconModule,
  MatButtonModule,
  MatTooltipModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoConfirmDialogModule } from '@igo2/common';

import { MapBrowserBindingDirective } from './map-browser/map-browser-binding.directive';
import { MapBrowserComponent } from './map-browser/map-browser.component';
import { ZoomButtonComponent } from './zoom-button/zoom-button.component';
import { GeolocateButtonComponent } from './geolocate-button/geolocate-button.component';
import { BaseLayersSwitcherComponent } from './baselayers-switcher/baselayers-switcher.component';
import { MiniBaseMapComponent } from './baselayers-switcher/mini-basemap.component';

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
    MapBrowserBindingDirective,
    ZoomButtonComponent,
    GeolocateButtonComponent,
    BaseLayersSwitcherComponent,
    MiniBaseMapComponent
  ],
  declarations: [
    MapBrowserComponent,
    MapBrowserBindingDirective,
    ZoomButtonComponent,
    GeolocateButtonComponent,
    BaseLayersSwitcherComponent,
    MiniBaseMapComponent
  ]
})
export class IgoMapModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoMapModule
    };
  }
}
