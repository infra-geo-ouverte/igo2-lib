import { NgModule } from '@angular/core';

import { IgoSpinnerModule } from '@igo2/common';
import { IgoActivityModule } from '@igo2/core';

import { SharedModule } from '../../shared/shared.module';
import { AppActivityRoutingModule } from './activity-routing.module';
import { AppActivityComponent } from './activity.component';

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
