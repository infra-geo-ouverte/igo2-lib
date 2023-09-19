import { NgModule } from '@angular/core';

import { IgoAppSearchBarModule } from './search-bar/search-bar.module';
import { IgoAppSearchResultsToolModule } from './search-results-tool/search-results-tool.module';

@NgModule({
  imports: [],
  declarations: [],
  exports: [IgoAppSearchBarModule, IgoAppSearchResultsToolModule]
})
export class IgoAppSearchModule {}
