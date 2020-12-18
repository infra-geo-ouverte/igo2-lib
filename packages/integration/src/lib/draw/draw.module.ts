import { NgModule } from '@angular/core';

import { IgoDrawerModule } from '@igo2/geo';
import { DrawerToolComponent } from './drawer-tool/drawer-tool.component'

@NgModule({
  imports: [IgoDrawerModule],
  declarations: [DrawerToolComponent],
  exports: [
    DrawerToolComponent
  ]
})
export class IgoAppDrawModule {}
