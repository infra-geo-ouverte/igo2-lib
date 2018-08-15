import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatIconModule,
  MatButtonModule,
  MatTooltipModule,
  MatListModule,
  MatFormFieldModule,
  MatInputModule,
  MatCheckboxModule,
  MatRadioModule
} from '@angular/material';

import { IgoAuthModule } from '@igo2/auth';
import { IgoLanguageModule } from '@igo2/core';
import {
  IgoListModule,
  IgoKeyValueModule,
  IgoCollapsibleModule
} from '@igo2/common';

import { MapContextDirective } from './shared/map-context.directive';
import { LayerContextDirective } from './shared/layer-context.directive';
import { ToolContextDirective } from './shared/tool-context.directive';
import { ContextListComponent } from './context-list/context-list.component';
import { ContextListBindingDirective } from './context-list/context-list-binding.directive';
import { ContextItemComponent } from './context-item/context-item.component';
import { ContextFormComponent } from './context-form/context-form.component';
import { ContextEditComponent } from './context-edit/context-edit.component';
import { ContextEditBindingDirective } from './context-edit/context-edit-binding.directive';
import { ContextToolsComponent } from './context-tools/context-tools.component';
import { ContextToolsBindingDirective } from './context-tools/context-tools-binding.directive';
import { ContextPermissionsComponent } from './context-permissions/context-permissions.component';
import { ContextPermissionsBindingDirective } from './context-permissions/context-permissions-binding.directive';

const CONTEXT_DIRECTIVES = [
  MapContextDirective,
  LayerContextDirective,
  ToolContextDirective
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatListModule,
    MatCheckboxModule,
    MatRadioModule,
    IgoAuthModule,
    IgoListModule,
    IgoKeyValueModule,
    IgoCollapsibleModule,
    IgoLanguageModule
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
export class IgoContextManagerModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoContextManagerModule
    };
  }
}
