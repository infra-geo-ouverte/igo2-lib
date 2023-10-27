import { NgModule } from '@angular/core';

import { IgoMapModule } from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppHoverRoutingModule } from './hover-routing.module';
import { AppHoverComponent } from './hover.component';

@NgModule({
  declarations: [AppHoverComponent],
  imports: [SharedModule, AppHoverRoutingModule, IgoMapModule],
  exports: [AppHoverComponent]
})
export class AppHoverModule {}
