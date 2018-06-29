import { NgModule, ModuleWithProviders } from '@angular/core';
import {
  MatProgressSpinnerModule,
  MatIconModule,
  MatListModule,
  MatTableModule,
  MatFormFieldModule,
  MatButtonModule
} from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';

import { IgoCoreModule } from '@igo/core';

import { ClickoutDirective } from './clickout';
import { ClonePipe } from './clone';
import { CollapsibleComponent, CollapseDirective } from './collapsible';
import { ConfirmDialogComponent, ConfirmDialogService } from './confirm-dialog';
import { DragAndDropDirective } from './drag-drop';
import { KeyvaluePipe } from './keyvalue';
import { SecureImagePipe } from './image';
import { ListComponent, ListItemDirective } from './list';
import { PanelComponent } from './panel';
import { SidenavShimDirective } from './sidenav';
import { SpinnerComponent, SpinnerBindingDirective } from './spinner';
import {
  StopPropagationDirective,
  StopDropPropagationDirective
} from './stop-propagation';
import { TableComponent } from './table';

@NgModule({
  imports: [
    IgoCoreModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatListModule,
    MatTableModule,
    MatFormFieldModule,
    MatButtonModule,
    CdkTableModule
  ],
  declarations: [
    ClickoutDirective,
    ClonePipe,
    CollapsibleComponent,
    CollapseDirective,
    ConfirmDialogComponent,
    DragAndDropDirective,
    KeyvaluePipe,
    ListComponent,
    ListItemDirective,
    PanelComponent,
    SidenavShimDirective,
    SecureImagePipe,
    SpinnerComponent,
    SpinnerBindingDirective,
    StopPropagationDirective,
    StopDropPropagationDirective,
    TableComponent
  ],
  exports: [
    ClickoutDirective,
    ClonePipe,
    CollapsibleComponent,
    CollapseDirective,
    ConfirmDialogComponent,
    DragAndDropDirective,
    KeyvaluePipe,
    ListComponent,
    ListItemDirective,
    PanelComponent,
    SidenavShimDirective,
    SecureImagePipe,
    SpinnerComponent,
    SpinnerBindingDirective,
    StopPropagationDirective,
    StopDropPropagationDirective,
    TableComponent
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
