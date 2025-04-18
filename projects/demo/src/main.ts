import { provideHttpClient, withJsonpSupport } from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';
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

import { provideAuthentification } from '@igo2/auth';
import { provideIcon } from '@igo2/common/icon';
import { IgoCoreModule } from '@igo2/core';
import { provideConfig } from '@igo2/core/config';
import { provideTranslation, withStaticConfig } from '@igo2/core/language';

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
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' }
    },
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: defaultTooltipOptions }
  ]
}).catch((err) => console.log(err));
