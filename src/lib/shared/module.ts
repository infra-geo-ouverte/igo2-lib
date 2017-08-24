import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomMaterialModule } from '../customMaterialModule';
import { TranslateModule } from '@ngx-translate/core';

import { ClickoutDirective } from './clickout';
import { CollapsibleComponent, CollapseDirective } from './collapsible';
import { ConfirmDialogComponent, ConfirmDialogService } from './confirm-dialog';
import { ClonePipe } from './clone';
import { KeyvaluePipe } from './keyvalue';
import { ListComponent, ListItemDirective } from './list';
import { PanelComponent } from './panel';
import { SidenavShimDirective } from './sidenav';
import { SpinnerComponent, SpinnerBindingDirective } from './spinner';
import { StopPropagationDirective } from './stop-propagation';
import { TableComponent } from './table';


@NgModule({
  imports: [
    CommonModule,
    CdkTableModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    CustomMaterialModule,
    TranslateModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    BrowserAnimationsModule,
    CustomMaterialModule,
    TranslateModule,
    ClickoutDirective,
    CollapsibleComponent,
    CollapseDirective,
    ClonePipe,
    KeyvaluePipe,
    ListComponent,
    ListItemDirective,
    PanelComponent,
    SidenavShimDirective,
    SpinnerComponent,
    SpinnerBindingDirective,
    StopPropagationDirective,
    TableComponent
  ],
  declarations: [
    ClickoutDirective,
    CollapsibleComponent,
    CollapseDirective,
    ConfirmDialogComponent,
    ClonePipe,
    KeyvaluePipe,
    ListComponent,
    ListItemDirective,
    PanelComponent,
    SidenavShimDirective,
    SpinnerComponent,
    SpinnerBindingDirective,
    StopPropagationDirective,
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
