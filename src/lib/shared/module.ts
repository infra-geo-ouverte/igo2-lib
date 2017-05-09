import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';

import { ClickoutDirective } from './clickout';
import { CollapsibleComponent, CollapseDirective } from './collapsible';
import { ClonePipe } from './clone';
import { KeyvaluePipe } from './keyvalue';
import { ListComponent, ListItemDirective } from './list';
import { PanelComponent } from './panel';
import { SidenavShimDirective } from './sidenav';
import { SpinnerComponent, SpinnerBindingDirective } from './spinner';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    MaterialModule,
    TranslateModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    BrowserAnimationsModule,
    MaterialModule,
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
    SpinnerBindingDirective
  ],
  declarations: [
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
    SpinnerBindingDirective
  ]
})
export class IgoSharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoSharedModule,
      providers: []
    };
  }
}

export * from './collapsible';
export * from './clickout';
export * from './clone';
export * from './keyvalue';
export * from './list';
export * from './panel';
export * from './sidenav';
export * from './spinner';
