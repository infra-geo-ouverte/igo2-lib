import { ModuleWithProviders, NgModule } from '@angular/core';

import { ShareMapApiComponent } from './share-map/share-map-api.component';
import { ShareMapUrlComponent } from './share-map/share-map-url.component';
import { ShareMapComponent } from './share-map/share-map.component';

/**
 * @deprecated import the components/directives directly or SHARE_MAP_DIRECTIVES for the set
 */
@NgModule({
  imports: [ShareMapComponent, ShareMapUrlComponent, ShareMapApiComponent],
  exports: [ShareMapComponent, ShareMapUrlComponent, ShareMapApiComponent]
})
export class IgoShareMapModule {
  static forRoot(): ModuleWithProviders<IgoShareMapModule> {
    return {
      ngModule: IgoShareMapModule
    };
  }
}
