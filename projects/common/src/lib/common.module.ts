import { NgModule, ModuleWithProviders } from '@angular/core';
import {
  MatProgressSpinnerModule,
  MatIconModule,
  MatListModule
} from '@angular/material';

import { IgoCoreModule } from '@igo/core';

import { ClickoutDirective } from './clickout';
import { ClonePipe } from './clone';
import { CollapsibleComponent, CollapseDirective } from './collapsible';
import { ConfirmDialogComponent, ConfirmDialogService } from './confirm-dialog';
import { DragAndDropDirective } from './drag-drop';
import { KeyvaluePipe } from './keyvalue';
import { SecureImagePipe } from './image';
import { SpinnerComponent, SpinnerBindingDirective } from './spinner';
import {
  StopPropagationDirective,
  StopDropPropagationDirective
} from './stop-propagation';

@NgModule({
  imports: [
    IgoCoreModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatListModule
  ],
  declarations: [
    ClickoutDirective,
    ClonePipe,
    CollapsibleComponent,
    CollapseDirective,
    ConfirmDialogComponent,
    DragAndDropDirective,
    KeyvaluePipe,
    SecureImagePipe,
    SpinnerComponent,
    SpinnerBindingDirective,
    StopPropagationDirective,
    StopDropPropagationDirective
  ],
  exports: [
    ClickoutDirective,
    ClonePipe,
    CollapsibleComponent,
    CollapseDirective,
    ConfirmDialogComponent,
    DragAndDropDirective,
    KeyvaluePipe,
    SecureImagePipe,
    SpinnerComponent,
    SpinnerBindingDirective,
    StopPropagationDirective,
    StopDropPropagationDirective
  ],
  entryComponents: [ConfirmDialogComponent]
})
export class IgoCommonModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoCommonModule,
      providers: []
    };
  }
}
