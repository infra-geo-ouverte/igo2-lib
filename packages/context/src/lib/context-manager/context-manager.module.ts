import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { IgoAuthModule } from '@igo2/auth';
import { IgoLanguageModule } from '@igo2/core';
import {
  IgoListModule,
  IgoKeyValueModule,
  IgoCollapsibleModule,
  IgoStopPropagationModule,
  IgoActionbarModule
} from '@igo2/common';

import { MapContextDirective } from './shared/map-context.directive';
import { LayerContextDirective } from './shared/layer-context.directive';
import { ContextListComponent } from './context-list/context-list.component';
import { ContextListBindingDirective } from './context-list/context-list-binding.directive';
import { ContextItemComponent } from './context-item/context-item.component';
import { ContextFormComponent } from './context-form/context-form.component';
import { ContextEditComponent } from './context-edit/context-edit.component';
import { ContextEditBindingDirective } from './context-edit/context-edit-binding.directive';
import { ContextPermissionsComponent } from './context-permissions/context-permissions.component';
import { ContextPermissionsBindingDirective } from './context-permissions/context-permissions-binding.directive';
import { IgoContextMapButtonModule } from '../context-map-button/context-map-button.module';
import { IgoContextImportExportModule } from '../context-import-export/context-import-export.module';

const CONTEXT_DIRECTIVES = [
  MapContextDirective,
  LayerContextDirective
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
    IgoActionbarModule
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
