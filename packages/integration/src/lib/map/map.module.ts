import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import {
  IgoLayerModule,
  IgoMetadataModule,
  IgoDownloadModule,
  IgoFilterModule
} from '@igo2/geo';
import { MapDetailsToolComponent } from './map-details-tool/map-details-tool.component';

@NgModule({
  imports: [
    IgoLayerModule,
    IgoMetadataModule,
    IgoDownloadModule,
    IgoFilterModule
  ],
  declarations: [MapDetailsToolComponent],
  exports: [MapDetailsToolComponent],
  entryComponents: [MapDetailsToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppMapModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoAppMapModule,
      providers: []
    };
  }
}
