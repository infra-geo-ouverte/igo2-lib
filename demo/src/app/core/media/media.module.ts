import { NgModule } from '@angular/core';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

import { AppMediaComponent } from './media.component';
import { AppMediaRoutingModule } from './media-routing.module';

@NgModule({
  declarations: [AppMediaComponent],
  imports: [AppMediaRoutingModule, MatCardModule],
  exports: [AppMediaComponent]
})
export class AppMediaModule {}
