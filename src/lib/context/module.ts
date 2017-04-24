import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { ContextService, MapContextDirective,
         LayerContextDirective, ToolContextDirective } from './shared';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    MapContextDirective,
    LayerContextDirective,
    ToolContextDirective
  ],
  declarations: [
    MapContextDirective,
    LayerContextDirective,
    ToolContextDirective
  ]
})
export class IgoContextModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoContextModule,
      providers: [
        ContextService
      ]
    };
  }
}

export * from './shared';
