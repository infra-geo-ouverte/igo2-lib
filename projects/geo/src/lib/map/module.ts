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

// import { IgoAuthModule } from '@igo2/auth';
import { IgoCoreModule } from '@igo2/core';
import { IgoCommonModule } from '@igo2/common';

import { MapBrowserBindingDirective } from './map-browser/map-browser-binding.directive';
import { MapBrowserComponent } from './map-browser/map-browser.component';
import { ZoomButtonComponent } from './zoom-button/zoom-button.component';
import { GeolocateButtonComponent } from './geolocate-button/geolocate-button.component';
import { BookmarkButtonComponent } from './bookmark-button/bookmark-button.component';
import { BookmarkDialogComponent } from './bookmark-button/bookmark-dialog.component';
import { PoiButtonComponent } from './poi-button/poi-button.component';
import { PoiDialogComponent } from './poi-button/poi-dialog.component';
import { PoiService } from './poi-button/shared/poi.service';
import { UserDialogComponent } from './user-button/user-dialog.component';
import { UserButtonComponent } from './user-button/user-button.component';
import { BaseLayersSwitcherComponent } from './baselayers-switcher/baselayers-switcher.component';
import { MiniBaseMapComponent } from './baselayers-switcher/mini-basemap.component';

@NgModule({
  imports: [
    IgoCoreModule,
    IgoCommonModule,
    // IgoAuthModule,
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
