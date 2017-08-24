import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { ContextService, MapContextDirective, LayerContextDirective,
         ToolContextDirective } from './shared';
import { ContextListComponent,
         ContextListBindingDirective } from './context-list';
import { ContextItemComponent } from './context-item';
import { ContextFormComponent } from './context-form';
import { ContextEditComponent,
         ContextEditBindingDirective } from './context-edit';

import { ContextToolsComponent,
         ContextToolsBindingDirective } from './context-tools';

import { ContextPermissionsComponent,
         ContextPermissionsBindingDirective } from './context-permissions';

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
    ContextFormComponent,
    ContextEditComponent,
    ContextEditBindingDirective,
    ContextToolsComponent,
    ContextToolsBindingDirective,
    ContextPermissionsComponent,
    ContextPermissionsBindingDirective,

    ...CONTEXT_DIRECTIVES
  ],
  declarations: [
    ContextListComponent,
    ContextListBindingDirective,
    ContextItemComponent,
    ContextFormComponent,
    ContextEditComponent,
    ContextEditBindingDirective,
    ContextToolsComponent,
    ContextToolsBindingDirective,
    ContextPermissionsComponent,
    ContextPermissionsBindingDirective,

    ...CONTEXT_DIRECTIVES
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
