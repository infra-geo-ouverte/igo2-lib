import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoAuthModule } from '@igo2/auth';
import {
  ActionbarComponent,
  IgoCollapsibleModule,
  IgoKeyValueModule,
  IgoListModule,
  IgoStopPropagationModule
} from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { IgoContextImportExportModule } from '../context-import-export/context-import-export.module';
import { IgoContextMapButtonModule } from '../context-map-button/context-map-button.module';
import { ContextEditBindingDirective } from './context-edit/context-edit-binding.directive';
import { ContextEditComponent } from './context-edit/context-edit.component';
import { ContextFormComponent } from './context-form/context-form.component';
import { ContextItemComponent } from './context-item/context-item.component';
import { ContextListBindingDirective } from './context-list/context-list-binding.directive';
import { ContextListComponent } from './context-list/context-list.component';
import { ContextPermissionsBindingDirective } from './context-permissions/context-permissions-binding.directive';
import { ContextPermissionsComponent } from './context-permissions/context-permissions.component';
import { LayerContextDirective } from './shared/layer-context.directive';
import { MapContextDirective } from './shared/map-context.directive';

const CONTEXT_DIRECTIVES = [MapContextDirective, LayerContextDirective];

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
    MatDialogModule,
    MatMenuModule,
    MatOptionModule,
    MatAutocompleteModule,
    IgoAuthModule,
    IgoListModule,
    IgoKeyValueModule,
    IgoCollapsibleModule,
    IgoStopPropagationModule,
    IgoLanguageModule,
    IgoContextImportExportModule,
    IgoContextMapButtonModule,
    ActionbarComponent
  ],
  exports: [
    ContextListComponent,
    ContextListBindingDirective,
    ContextItemComponent,
    ContextFormComponent,
    ContextEditComponent,
    ContextEditBindingDirective,
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
    ContextPermissionsComponent,
    ContextPermissionsBindingDirective,

    ...CONTEXT_DIRECTIVES
  ]
})
export class IgoContextManagerModule {
  static forRoot(): ModuleWithProviders<IgoContextManagerModule> {
    return {
      ngModule: IgoContextManagerModule
    };
  }
}
