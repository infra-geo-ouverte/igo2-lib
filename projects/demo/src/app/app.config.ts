import { provideHttpClient, withJsonpSupport } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { importProvidersFrom } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatTooltipDefaultOptions
} from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PreloadAllModules,
  provideRouter,
  withPreloading
} from '@angular/router';

import { provideAuthentification } from '@igo2/auth';
import { provideAuthUserMonitoring } from '@igo2/auth/monitoring';
import { provideIcon } from '@igo2/common/icon';
import { IgoCoreModule } from '@igo2/core';
import { provideConfig } from '@igo2/core/config';
import { provideTranslation, withStaticConfig } from '@igo2/core/language';
import { provideSentryMonitoring } from '@igo2/core/monitoring';
import { provideOffline } from '@igo2/geo';

import { environment } from '../environments/environment';
import { routes } from './app.routing';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      IgoCoreModule,
      BrowserModule,
      MatButtonModule,
      MatIconModule,
      MatListModule,
      MatSidenavModule,
      MatToolbarModule
    ),
    provideHttpClient(withJsonpSupport()),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAnimations(),
    provideConfig({
      default: environment.igo
    }),
    provideTranslation(withStaticConfig(environment.igo.language)),
    provideAuthentification(),
    provideIcon(),
    provideSentryMonitoring(environment.igo.monitoring),
    provideAuthUserMonitoring(environment.igo.monitoring),
    provideOffline({ enable: true }),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' } satisfies MatFormFieldDefaultOptions
    },
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: {
        showDelay: 500,
        hideDelay: 0,
        touchendHideDelay: 0,
        disableTooltipInteractivity: true
      } satisfies MatTooltipDefaultOptions
    }
  ]
};
