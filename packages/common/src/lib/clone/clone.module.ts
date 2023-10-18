import { ModuleWithProviders, NgModule } from '@angular/core';

import { ClonePipe } from './clone.pipe';

@NgModule({
  imports: [],
  declarations: [ClonePipe],
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
