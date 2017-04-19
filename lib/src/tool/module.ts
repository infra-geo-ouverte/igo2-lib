import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { ToolService } from './shared';
import { ToolbarComponent, ToolbarBaseComponent } from './toolbar';
import { ToolbarItemComponent } from './toolbar-item';
import { ToolboxComponent } from './toolbox';

@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    ToolbarBaseComponent,
    ToolbarComponent,
    ToolbarItemComponent,
    ToolboxComponent
  ],
  declarations: [
    ToolbarBaseComponent,
    ToolbarComponent,
    ToolbarItemComponent,
    ToolboxComponent
  ]})
export class IgoToolModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoToolModule,
      providers: [
        ToolService
      ]
    };
  }
}

export * from './shared';
export * from './toolbar';
export * from './toolbar-item';
export * from './toolbox';
