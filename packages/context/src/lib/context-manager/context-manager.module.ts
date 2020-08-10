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
  MatRadioModule,
  MatDialogModule,
  MatMenuModule,
  MatOptionModule,
  MatAutocompleteModule
} from '@angular/material';

import { IgoAuthModule } from '@igo2/auth';
import { IgoLanguageModule } from '@igo2/core';
import {
  IgoListModule,
  IgoKeyValueModule,
  IgoCollapsibleModule,
  IgoStopPropagationModule,
  IgoActionbarModule
} from '@igo2/common';

import { BookmarkDialogComponent } from './../context-map-button/bookmark-button/bookmark-dialog.component';
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
  entryComponents: [
    BookmarkDialogComponent
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
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoContextManagerModule
    };
  }
}
