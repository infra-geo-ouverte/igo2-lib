import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import {
  MatSidenavModule,
  MatToolbarModule,
  MatIconModule,
  MatListModule
} from '@angular/material';

import { AppHomeModule } from './core/home/home.module';
import { AppActivityModule } from './core/activity/activity.module';
import { AppLanguageModule } from './core/language/language.module';
import { AppMediaModule } from './core/media/media.module';
import { AppMessageModule } from './core/message/message.module';
import { AppRequestModule } from './core/request/request.module';

import { AppSimpleMapModule } from './geo/simple-map/simple-map.module';
import { AppOverlayModule } from './geo/overlay/overlay.module';
import { AppFeatureModule } from './geo/feature/feature.module';
import { AppQueryModule } from './geo/query/query.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,

    AppHomeModule,
    AppActivityModule,
    AppLanguageModule,
    AppMediaModule,
    AppMessageModule,
    AppRequestModule,

    AppSimpleMapModule,
    AppOverlayModule,
    AppFeatureModule,
    AppQueryModule,

    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
