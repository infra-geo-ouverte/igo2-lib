import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { IgoFeatureModule, IgoSearchModule } from '@igo2/geo';
import { SearchResultsToolComponent } from './search-results-tool/search-results-tool.component';

@NgModule({
  imports: [IgoFeatureModule, IgoSearchModule],
  declarations: [SearchResultsToolComponent],
  exports: [SearchResultsToolComponent],
  entryComponents: [SearchResultsToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppSearchModule {}
