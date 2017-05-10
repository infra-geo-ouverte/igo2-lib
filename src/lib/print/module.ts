import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { PrintComponent, PrintBindingDirective } from './print';
import { PrintFormComponent } from './print-form';
import { PrintService } from './shared';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    PrintComponent,
    PrintBindingDirective,
    PrintFormComponent
  ],
  declarations: [
    PrintComponent,
    PrintBindingDirective,
    PrintFormComponent
  ]
})
export class IgoPrintModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoPrintModule,
      providers: [
        PrintService
      ]
    };
  }
}
