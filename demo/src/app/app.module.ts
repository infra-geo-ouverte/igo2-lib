import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import {
  MatSidenavModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatListModule
} from '@angular/material';

import { AppHomeModule } from './core/home/home.module';
import { AppActivityModule } from './core/activity/activity.module';
import { AppConfigModule } from './core/config/config.module';
import { AppLanguageModule } from './core/language/language.module';
import { AppMediaModule } from './core/media/media.module';
import { AppMessageModule } from './core/message/message.module';
import { AppRequestModule } from './core/request/request.module';

import { AppAuthFormModule } from './auth/auth-form/auth-form.module';

import { AppSimpleMapModule } from './geo/simple-map/simple-map.module';
import { AppLayerModule } from './geo/layer/layer.module';
import { AppOverlayModule } from './geo/overlay/overlay.module';
import { AppFeatureModule } from './geo/feature/feature.module';
import { AppQueryModule } from './geo/query/query.module';
import { AppCatalogModule } from './geo/catalog/catalog.module';
import { AppSearchModule } from './geo/search/search.module';
import { AppPrintModule } from './geo/print/print.module';
import { AppDirectionsModule } from './geo/directions/directions.module';
import { AppTimeFilterModule } from './geo/time-filter/time-filter.module';
import { AppOgcFilterModule } from './geo/ogc-filter/ogc-filter.module';

import { AppContextModule } from './context/context/context.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,

    AppHomeModule,
    AppActivityModule,
    AppConfigModule,
    AppLanguageModule,
    AppMediaModule,
    AppMessageModule,
    AppRequestModule,

    AppAuthFormModule,

    AppSimpleMapModule,
    AppLayerModule,
    AppOverlayModule,
    AppFeatureModule,
    AppQueryModule,
    AppCatalogModule,
    AppSearchModule,
    AppPrintModule,
    AppDirectionsModule,
    AppTimeFilterModule,
    AppOgcFilterModule,

    AppContextModule,

    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
