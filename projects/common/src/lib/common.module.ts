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

import { IgoCoreModule } from '@igo2/core';

import { ClickoutDirective } from './clickout/clickout.directive';
import { ClonePipe } from './clone/clone.pipe';
import { CollapseDirective } from './collapsible/collapse.directive';
import { CollapsibleComponent } from './collapsible/collapsible.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from './confirm-dialog/confirm-dialog.service';
import { DragAndDropDirective } from './drag-drop/drag-drop.directive';
import { KeyvaluePipe } from './keyvalue/keyvalue.pipe';
import { SecureImagePipe } from './image/secure-image.pipe';
import { ListComponent } from './list/list.component';
import { ListItemDirective } from './list/list-item.directive';
import { PanelComponent } from './panel/panel.component';
import { SidenavShimDirective } from './sidenav/sidenav-shim.directive';
import { SpinnerComponent } from './spinner/spinner.component';
import { SpinnerBindingDirective } from './spinner/spinner-binding.directive';
import { StopPropagationDirective } from './stop-propagation/stop-propagation.directive';
import { StopDropPropagationDirective } from './stop-propagation/stop-drop-propagation.directive';
import { TableComponent } from './table/table.component';

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
  providers: [ConfirmDialogService],
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
