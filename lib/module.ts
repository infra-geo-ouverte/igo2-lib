import { NgModule, ModuleWithProviders } from '@angular/core';

import { SearchModule } from './search/index';

const MATERIAL_MODULES = [
  SearchModule
];

@NgModule({
  imports: [
    SearchModule.forRoot()
  ],
  exports: MATERIAL_MODULES,
})
export class MaterialRootModule { }
