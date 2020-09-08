import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToolService } from './shared/tool.service';
import { IgoToolboxModule } from './toolbox/toolbox.module';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    IgoToolboxModule
  ],
  declarations: []
})
export class IgoToolModule {
  static forRoot(): ModuleWithProviders<IgoToolModule> {
    return {
      ngModule: IgoToolModule,
      providers: [
        ToolService
      ]
    };
  }
}
