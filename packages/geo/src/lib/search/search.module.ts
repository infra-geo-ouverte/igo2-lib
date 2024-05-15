import { ModuleWithProviders, NgModule } from '@angular/core';

import { SearchBarComponent } from './search-bar/search-bar.component';
import { IgoSearchBarModule } from './search-bar/search-bar.module';
import { SEARCH_RESULTS_DIRECTIVES } from './search-results';
import { IgoSearchResultsModule } from './search-results/search-results.module';
import { SearchSelectorComponent } from './search-selector/search-selector.component';
import { IgoSearchSelectorModule } from './search-selector/search-selector.module';
import { SearchSettingsComponent } from './search-settings/search-settings.component';
import { IgoSearchSettingsModule } from './search-settings/search-settings.module';
import { SearchPointerSummaryDirective } from './shared/search-pointer-summary.directive';
import { provideSearchSourceService } from './shared/search-source-service.providers';
import { SearchService } from './shared/search.service';
import { provideDefaultCoordinatesSearchResultFormatter } from './shared/sources/coordinates.providers';
import { provideDefaultIChercheSearchResultFormatter } from './shared/sources/icherche.providers';
import { provideILayerSearchResultFormatter } from './shared/sources/ilayer.providers';

export const SEARCH_DIRECTIVES = [
  SearchBarComponent,
  SearchSelectorComponent,
  ...SEARCH_RESULTS_DIRECTIVES,
  SearchSettingsComponent,
  SearchPointerSummaryDirective
] as const;

@NgModule({
  imports: [
    IgoSearchBarModule,
    IgoSearchSelectorModule,
    IgoSearchResultsModule,
    IgoSearchSettingsModule,
    SearchPointerSummaryDirective
  ],
  exports: [
    IgoSearchBarModule,
    IgoSearchSelectorModule,
    IgoSearchResultsModule,
    IgoSearchSettingsModule,
    SearchPointerSummaryDirective
  ]
})
export class IgoSearchModule {
  static forRoot(): ModuleWithProviders<IgoSearchModule> {
    return {
      ngModule: IgoSearchModule,
      providers: [
        SearchService,
        provideSearchSourceService(),
        provideDefaultIChercheSearchResultFormatter(),
        provideDefaultCoordinatesSearchResultFormatter(),
        provideILayerSearchResultFormatter()
      ]
    };
  }
}
