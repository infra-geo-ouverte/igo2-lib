import { ModuleWithProviders, NgModule } from '@angular/core';

import {
  MetadataAbstractComponent,
  MetadataButtonComponent
} from './metadata-button/metadata-button.component';

export const METADATA_DIRECTIVES = [
  MetadataButtonComponent,
  MetadataAbstractComponent
] as const;

/**
 * @deprecated import the components/directives directly or METADATA_DIRECTIVES for the set
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
