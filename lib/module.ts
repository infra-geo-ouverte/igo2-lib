import { NgModule, ModuleWithProviders } from '@angular/core';
import { MaterialModule } from '@angular/material';

import { IgoSearchModule } from './search/index';

const IGO_MODULES = [
  IgoSearchModule
];

@NgModule({
  imports: [
    MaterialModule.forRoot(),
    IgoSearchModule
  ],
  exports: IGO_MODULES
})
export class IgoModule { }
