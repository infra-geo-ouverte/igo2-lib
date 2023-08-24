import { NgModule } from '@angular/core';

import { AppMediaComponent } from './media.component';
import { AppMediaRoutingModule } from './media-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppMediaComponent],
  imports: [AppMediaRoutingModule, SharedModule],
  exports: [AppMediaComponent]
})
export class AppMediaModule {}
