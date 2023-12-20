import { ModuleWithProviders, NgModule } from '@angular/core';

import {
  MetadataAbstractComponent,
  MetadataButtonComponent
} from './metadata-button/metadata-button.component';

/**
 * @deprecated import the components/directives directly or METADATA_DIRECTIVES for everything
 */
@NgModule({
  imports: [MetadataButtonComponent, MetadataAbstractComponent],
  exports: [MetadataButtonComponent, MetadataAbstractComponent]
})
export class IgoMetadataModule {
  static forRoot(): ModuleWithProviders<IgoMetadataModule> {
    return {
      ngModule: IgoMetadataModule,
      providers: []
    };
  }
}
