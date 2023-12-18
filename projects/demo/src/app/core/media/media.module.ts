import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { AppMediaRoutingModule } from './media-routing.module';
import { AppMediaComponent } from './media.component';

@NgModule({
  imports: [AppMediaRoutingModule, SharedModule, AppMediaComponent],
  exports: [AppMediaComponent]
})
export class AppMediaModule {}
