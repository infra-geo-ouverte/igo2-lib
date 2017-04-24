import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { ToolService } from './shared';
import { ToolbarComponent, ToolbarBehaviorDirective } from './toolbar';
import { ToolbarItemComponent } from './toolbar-item';
import { ToolboxComponent } from './toolbox';

@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    ToolbarComponent,
    ToolbarBehaviorDirective,
    ToolbarItemComponent,
    ToolboxComponent
  ],
  declarations: [
    ToolbarComponent,
    ToolbarBehaviorDirective,
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
