import { DatePipe } from '@angular/common';
import {
  APP_INITIALIZER,
  ApplicationRef,
  enableProdMode,
  importProvidersFrom
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatTooltipDefaultOptions
} from '@angular/material/tooltip';
import {
  BrowserModule,
  HammerModule,
  bootstrapApplication
} from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PreloadAllModules,
  provideRouter,
  withPreloading
} from '@angular/router';

import {
  IgoCoreModule,
  LanguageService,
  provideConfigOptions
} from '@igo2/core';
import {
  IgoDirectionsModule,
  IgoGeoWorkspaceModule,
  provideCoordinatesReverseSearchSource,
  provideIChercheReverseSearchSource,
  provideIChercheSearchSource,
  provideILayerSearchSource,
  provideNominatimSearchSource,
  provideOsrmDirectionsSource,
  provideStoredQueriesSearchSource,
  provideWorkspaceSearchSource
} from '@igo2/geo';

import { concatMap, first } from 'rxjs';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routing';
import { environment } from './environments/environment';

export const defaultTooltipOptions: MatTooltipDefaultOptions = {
  showDelay: 500,
  hideDelay: 0,
  touchendHideDelay: 0,
  disableTooltipInteractivity: true
};

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      IgoCoreModule,
      BrowserModule,
      HammerModule,
      MatButtonModule,
      MatIconModule,
      MatListModule,
      MatSidenavModule,
      MatToolbarModule,
      IgoGeoWorkspaceModule,
      IgoDirectionsModule
    ),
    provideConfigOptions({
      default: environment.igo
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' }
    },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [ApplicationRef, LanguageService],
      multi: true
    },
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: defaultTooltipOptions },
    DatePipe,
    provideAnimations(),
    provideOsrmDirectionsSource(),
    provideIChercheSearchSource(),
    provideNominatimSearchSource(),
    provideWorkspaceSearchSource(),
    provideIChercheReverseSearchSource(),
    provideCoordinatesReverseSearchSource(),
    provideILayerSearchSource(),
    provideStoredQueriesSearchSource()
  ]
}).catch((err) => console.log(err));

export function appInitializerFactory(
  applicationRef: ApplicationRef,
  languageService: LanguageService
) {
  return () =>
    new Promise<any>((resolve: any) => {
      applicationRef.isStable
        .pipe(
          first((isStable) => isStable === true),
          concatMap(() => {
            const lang = languageService.getLanguage();
            return languageService.translate.getTranslation(lang);
          })
        )
        .subscribe((translations) => {
          const lang = languageService.getLanguage();
          languageService.translate.setTranslation(lang, translations);
          resolve();
        });
    });
}
