import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { provideSearchSourceService } from './shared/search-source-service.providers';
import { provideDefaultIChercheSearchResultFormatter } from './shared/sources/icherche.providers';
import { provideDefaultCoordinatesSearchResultFormatter } from './shared/sources/coordinates.providers';

import { IgoSearchBarModule } from './search-bar/search-bar.module';
import { IgoSearchSelectorModule } from './search-selector/search-selector.module';
import { IgoSearchResultsModule } from './search-results/search-results.module';
import { IgoSearchSettingsModule } from './search-settings/search-settings.module';

@NgModule({
  imports: [
    CommonModule,
    IgoSearchBarModule,
    IgoSearchSelectorModule,
    IgoSearchResultsModule,
    IgoSearchSettingsModule
  ],
  exports: [
    IgoSearchBarModule,
    IgoSearchSelectorModule,
    IgoSearchResultsModule,
    IgoSearchSettingsModule
  ],
  declarations: []
})
export class IgoSearchModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoSearchModule,
      providers: [
        provideSearchSourceService(),
        provideDefaultIChercheSearchResultFormatter(),
        provideDefaultCoordinatesSearchResultFormatter()
      ]
    };
  }
}
