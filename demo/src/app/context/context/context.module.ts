import { NgModule } from '@angular/core';
import { MatCardModule, MatButtonModule } from '@angular/material';

import { IgoMapModule } from '@igo2/geo';
import { IgoContextModule } from '@igo2/context';

import { AppContextComponent } from './context.component';
import { AppContextRoutingModule } from './context-routing.module';

@NgModule({
  declarations: [AppContextComponent],
  imports: [
    AppContextRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoMapModule,
    IgoContextModule
  ],
  exports: [AppContextComponent]
})
export class AppContextModule {}
