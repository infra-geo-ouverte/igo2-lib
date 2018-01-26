import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomMaterialModule } from '../customMaterialModule';
import { TranslateModule } from '@ngx-translate/core';

import { ClickoutDirective } from './clickout';
import { CollapsibleComponent, CollapseDirective } from './collapsible';
import { ConfirmDialogComponent, ConfirmDialogService } from './confirm-dialog';
import { ClonePipe } from './clone';
import { DragAndDropDirective } from './drag-drop';
import { KeyvaluePipe } from './keyvalue';
import { ListComponent, ListItemDirective } from './list';
import { PanelComponent } from './panel';
import { SidenavShimDirective } from './sidenav';
import { SpinnerComponent, SpinnerBindingDirective } from './spinner';
import { StopPropagationDirective, StopDropPropagationDirective } from './stop-propagation';
import { TableComponent } from './table';


@NgModule({
  imports: [
    CommonModule,
    CdkTableModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CustomMaterialModule,
    TranslateModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CustomMaterialModule,
    TranslateModule,
    ClickoutDirective,
    CollapsibleComponent,
    CollapseDirective,
    ClonePipe,
    DragAndDropDirective,
    KeyvaluePipe,
    ListComponent,
    ListItemDirective,
    PanelComponent,
    SidenavShimDirective,
    SpinnerComponent,
    SpinnerBindingDirective,
    StopPropagationDirective,
    StopDropPropagationDirective,
    TableComponent
  ],
  declarations: [
    ClickoutDirective,
    CollapsibleComponent,
    CollapseDirective,
    ConfirmDialogComponent,
    ClonePipe,
    DragAndDropDirective,
    KeyvaluePipe,
    ListComponent,
    ListItemDirective,
    PanelComponent,
    SidenavShimDirective,
    SpinnerComponent,
    SpinnerBindingDirective,
    StopPropagationDirective,
    StopDropPropagationDirective,
    TableComponent
  ],
  entryComponents: [
    ConfirmDialogComponent
  ],
  providers: [
    ConfirmDialogService
  ]
})
export class IgoSharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoSharedModule
    };
  }
}
