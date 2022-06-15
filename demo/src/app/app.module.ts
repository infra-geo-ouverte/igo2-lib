import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, NgModule } from '@angular/core';
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
import { AppSimpleListModule } from './geo/simple-list/simple-list.module';

import { AppContextModule } from './context/context/context.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LanguageService } from '@igo2/core';

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
    AppSimpleListModule,

    AppContextModule,

    AppRoutingModule,

    HammerModule
  ],
  providers: [
    {provide: APP_INITIALIZER, useFactory: appInitializerFactory, deps: [LanguageService], multi: true},
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

export function appInitializerFactory(languageService: LanguageService) {
  return () => new Promise<any>((resolve: any) => {
      languageService.translate.getTranslation(languageService.getLanguage()).subscribe(() => {
        console.info(`Successfully initialized '${languageService.getLanguage()}' language.'`);
      }, err => {
        console.error(`Problem with '${languageService.getLanguage()}' language initialization.'`);
      }, () => {
        resolve(null);
      });
  });
}
