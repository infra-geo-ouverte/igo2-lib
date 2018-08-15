import { NgModule } from '@angular/core';

import { AppHomeComponent } from './home.component';
import { AppHomeRoutingModule } from './home-routing.module';

@NgModule({
  declarations: [AppHomeComponent],
  imports: [AppHomeRoutingModule],
  exports: [AppHomeComponent]
})
export class AppHomeModule {}
