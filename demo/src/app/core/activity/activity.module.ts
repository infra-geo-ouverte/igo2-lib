import { NgModule } from '@angular/core';

import { IgoActivityModule } from '@igo2/core';
import { IgoSpinnerModule } from '@igo2/common';

import { AppActivityComponent } from './activity.component';
import { AppActivityRoutingModule } from './activity-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppActivityComponent],
  imports: [
    AppActivityRoutingModule,
    SharedModule,
    IgoActivityModule.forRoot(), // Only if you want register http calls
    IgoSpinnerModule
  ],
  exports: [AppActivityComponent]
})
export class AppActivityModule {}
