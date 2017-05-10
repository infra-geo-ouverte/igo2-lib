import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { ContextService, MapContextDirective, LayerContextDirective,
         ToolContextDirective, provideContextServiceOptions } from './shared';
import { ContextListComponent,
         ContextListBindingDirective } from './context-list';
import { ContextItemComponent } from './context-item';

const CONTEXT_DIRECTIVES = [
  MapContextDirective,
  LayerContextDirective,
  ToolContextDirective
];


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    ContextListComponent,
    ContextListBindingDirective,
    ContextItemComponent,

    ...CONTEXT_DIRECTIVES
  ],
  declarations: [
    ContextListComponent,
    ContextListBindingDirective,
    ContextItemComponent,

    ...CONTEXT_DIRECTIVES
  ]
})
export class IgoContextModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoContextModule,
      providers: [
        provideContextServiceOptions({
          basePath: 'contexts',
          contextListFile: '_contexts.json'
        }),
        ContextService
      ]
    };
  }
}
