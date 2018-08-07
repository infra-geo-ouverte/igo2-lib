import { NgModule } from '@angular/core';
import { MatCardModule, MatButtonModule } from '@angular/material';

import { IgoActivityModule } from '@igo2/core';

import { AppActivityComponent } from './activity.component';
import { AppActivityRoutingModule } from './activity-routing.module';

@NgModule({
  declarations: [AppActivityComponent],
  imports: [
    AppActivityRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoActivityModule.forRoot() // Only if you want register http calls
  ],
  exports: [AppActivityComponent]
})
export class AppActivityModule {}
