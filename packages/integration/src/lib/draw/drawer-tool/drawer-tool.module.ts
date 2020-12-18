import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { IgoDrawerModule } from '@igo2/geo';

import { DrawerToolComponent } from './drawer-tool.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    IgoDrawerModule
  ],
  declarations: [DrawerToolComponent],
  exports: [DrawerToolComponent],
  entryComponents: [DrawerToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppDrawerToolModule {}
