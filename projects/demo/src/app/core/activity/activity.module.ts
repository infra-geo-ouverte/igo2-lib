import { NgModule } from '@angular/core';

import { IgoSpinnerModule } from '@igo2/common';
import { IgoActivityModule } from '@igo2/core';


import { AppActivityRoutingModule } from './activity-routing.module';
import { AppActivityComponent } from './activity.component';

@NgModule({
  imports: [
    AppActivityRoutingModule,
    IgoActivityModule.forRoot(),
    IgoSpinnerModule,
    AppActivityComponent
],
  exports: [AppActivityComponent]
})
export class AppActivityModule {}
