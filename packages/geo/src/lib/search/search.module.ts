import { ModuleWithProviders, NgModule } from '@angular/core';

import { IgoSearchBarModule } from './search-bar/search-bar.module';
import { IgoSearchResultsModule } from './search-results/search-results.module';
import { IgoSearchSelectorModule } from './search-selector/search-selector.module';
import { IgoSearchSettingsModule } from './search-settings/search-settings.module';
import { SearchPointerSummaryDirective } from './shared/search-pointer-summary.directive';
import { provideSearchSourceService } from './shared/search-source-service.providers';
import { SearchService } from './shared/search.service';
import { provideDefaultCoordinatesSearchResultFormatter } from './shared/sources/coordinates.providers';
import { provideDefaultIChercheSearchResultFormatter } from './shared/sources/icherche.providers';
import { provideILayerSearchResultFormatter } from './shared/sources/ilayer.providers';

/**
 * @todo determine if we deprecate or not
 * Import the components directly or the SEARCH_DIRECTIVES for the set
 * You need to handle the search provider in your application
 */
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
