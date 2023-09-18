import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  APP_INITIALIZER,
  ApplicationRef,
  Injector,
  NgModule
} from '@angular/core';
import { HammerModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconRegistry, MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppHomeModule } from './core/home/home.module';
import { AppActivityModule } from './core/activity/activity.module';
import { AppConfigModule } from './core/config/config.module';
import { AppLanguageModule } from './core/language/language.module';
import { AppMediaModule } from './core/media/media.module';
import { AppMessageModule } from './core/message/message.module';
import { AppRequestModule } from './core/request/request.module';

import { AppActionModule } from './common/action/action.module';
import { AppDynamicComponentModule } from './common/dynamic-component/dynamic-component.module';
import { AppEntityTableModule } from './common/entity-table/entity-table.module';
import { AppEntitySelectorModule } from './common/entity-selector/entity-selector.module';
import { AppFormModule } from './common/form/form.module';
import { AppTableModule } from './common/table/table.module';
import { AppToolModule } from './common/tool/tool.module';
import { AppWidgetModule } from './common/widget/widget.module';

import { AppAuthFormModule } from './auth/auth-form/auth-form.module';

import { AppSimpleMapModule } from './geo/simple-map/simple-map.module';
import { AppLayerModule } from './geo/layer/layer.module';
import { AppLegendModule } from './geo/legend/legend.module';
import { AppOverlayModule } from './geo/overlay/overlay.module';
import { AppGeometryModule } from './geo/geometry/geometry.module';
import { AppFeatureModule } from './geo/feature/feature.module';
import { AppHoverModule } from './geo/hover/hover.module';
import { AppMeasureModule } from './geo/measure/measure.module';
import { AppDrawModule } from './geo/draw/draw.module';
import { AppQueryModule } from './geo/query/query.module';
import { AppCatalogModule } from './geo/catalog/catalog.module';
import { AppSearchModule } from './geo/search/search.module';
import { AppPrintModule } from './geo/print/print.module';
import { AppImportExport } from './geo/import-export/import-export.module';
import { AppDirectionsModule } from './geo/directions/directions.module';
import { AppTimeFilterModule } from './geo/time-filter/time-filter.module';
import { AppOgcFilterModule } from './geo/ogc-filter/ogc-filter.module';
import { AppSpatialFilterModule } from './geo/spatial-filter/spatial-filter.module';
import { AppWorkspaceModule } from './geo/workspace/workspace.module';

import { AppContextModule } from './context/context/context.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IgoCoreModule, LanguageService } from '@igo2/core';
import {
  MatTooltipDefaultOptions,
  MAT_TOOLTIP_DEFAULT_OPTIONS
} from '@angular/material/tooltip';
import { concatMap, first } from 'rxjs';
import { DatePipe } from '@angular/common';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MonitoringModule } from './core/monitoring/monitoring.module';

export const defaultTooltipOptions: MatTooltipDefaultOptions = {
  showDelay: 500,
  hideDelay: 0,
  touchendHideDelay: 0,
  disableTooltipInteractivity: true
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    IgoCoreModule,
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

    AppActionModule,
    AppDynamicComponentModule,
    AppEntityTableModule,
    AppEntitySelectorModule,
    AppFormModule,
    AppTableModule,
    AppToolModule,
    AppWidgetModule,

    AppAuthFormModule,

    AppSimpleMapModule,
    AppLayerModule,
    AppLegendModule,
    AppOverlayModule,
    AppGeometryModule,
    AppFeatureModule,
    AppHoverModule,
    AppMeasureModule,
    AppDrawModule,
    AppQueryModule,
    AppCatalogModule,
    AppSearchModule,
    AppPrintModule,
    AppImportExport,
    AppDirectionsModule,
    AppTimeFilterModule,
    AppOgcFilterModule,
    AppSpatialFilterModule,
    AppWorkspaceModule,
    MonitoringModule,

    AppContextModule,
    AppRoutingModule,

    HammerModule
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' }
    },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [Injector, ApplicationRef],
      multi: true
    },
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: defaultTooltipOptions },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(
      domSanitizer.bypassSecurityTrustResourceUrl(
        './assets/igo2/core/icons/mdi.svg'
      )
    );
  }
}

export function appInitializerFactory(
  injector: Injector,
  applicationRef: ApplicationRef
) {
  return () =>
    new Promise<any>((resolve: any) => {
      applicationRef.isStable
        .pipe(
          first((isStable) => isStable === true),
          concatMap(() => {
            const languageService = injector.get(LanguageService);
            const lang = languageService.getLanguage();
            return languageService.translate.getTranslation(lang);
          })
        )
        .subscribe((translations) => {
          const languageService = injector.get(LanguageService);
          const lang = languageService.getLanguage();
          languageService.translate.setTranslation(lang, translations);
          resolve();
        });
    });
}
