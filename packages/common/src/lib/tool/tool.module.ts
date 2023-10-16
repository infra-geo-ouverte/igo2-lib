import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { ToolService } from './shared/tool.service';
import { IgoToolboxModule } from './toolbox/toolbox.module';

@NgModule({
  imports: [CommonModule],
  exports: [IgoToolboxModule],
  declarations: []
})
export class IgoToolModule {
  static forRoot(): ModuleWithProviders<IgoToolModule> {
    return {
      ngModule: IgoToolModule,
      providers: [ToolService]
    };
  }
}
