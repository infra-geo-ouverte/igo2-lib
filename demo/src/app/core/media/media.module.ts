import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { AppMediaComponent } from './media.component';
import { AppMediaRoutingModule } from './media-routing.module';

@NgModule({
  declarations: [AppMediaComponent],
  imports: [AppMediaRoutingModule, MatCardModule],
  exports: [AppMediaComponent]
})
export class AppMediaModule {}
