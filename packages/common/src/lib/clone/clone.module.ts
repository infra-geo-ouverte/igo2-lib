import { ModuleWithProviders, NgModule } from '@angular/core';

import { ClonePipe } from './clone.pipe';

/**
 * @deprecated import the ClonePipe directly
 */
@NgModule({
  imports: [ClonePipe],
  exports: [ClonePipe]
})
export class IgoCloneModule {
  static forRoot(): ModuleWithProviders<IgoCloneModule> {
    return {
      ngModule: IgoCloneModule,
      providers: []
    };
  }
}
