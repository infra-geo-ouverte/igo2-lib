import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoActionbarModule } from './actionbar/actionbar.module';

@NgModule({
  imports: [CommonModule, IgoActionbarModule],
  exports: [IgoActionbarModule],
  declarations: [],
  providers: []
})
export class IgoActionModule {}
