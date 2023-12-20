import { NgModule } from '@angular/core';

import { SearchSettingsComponent } from './search-settings.component';

/**
 * @deprecated import the SearchSettingsComponent directly
 */
@NgModule({
  imports: [SearchSettingsComponent],
  exports: [SearchSettingsComponent]
})
export class IgoSearchSettingsModule {}
