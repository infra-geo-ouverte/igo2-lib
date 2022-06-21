import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { IgoSimpleFeatureListModule} from '@igo2/common';
import { IgoMapModule, IgoFeatureModule } from '@igo2/geo';

import { AppSimpleListComponent } from './simple-list.component';
import { AppSimpleListRoutingModule } from './simple-list-routing.module';

@NgModule({
  declarations: [AppSimpleListComponent],
  imports: [
    AppSimpleListRoutingModule,
    CommonModule,
    MatCardModule,
    IgoSimpleFeatureListModule,
    IgoMapModule,
    IgoFeatureModule
  ],
  exports: [AppSimpleListComponent]
})
export class AppSimpleListModule {}
