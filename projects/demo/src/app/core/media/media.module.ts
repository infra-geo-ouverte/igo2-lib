import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { AppMediaRoutingModule } from './media-routing.module';
import { AppMediaComponent } from './media.component';

@NgModule({
  declarations: [AppMediaComponent],
  imports: [AppMediaRoutingModule, SharedModule],
  exports: [AppMediaComponent]
})
export class AppMediaModule {}
