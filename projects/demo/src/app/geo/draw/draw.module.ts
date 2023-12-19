import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { IgoDrawModule, IgoMapModule } from '@igo2/geo';

import { AppDrawComponent } from './draw.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: AppDrawComponent
      }
    ])
  ],
  exports: [RouterModule]
})
class RoutingModule {}

@NgModule({
  imports: [IgoMapModule, IgoDrawModule, AppDrawComponent, RoutingModule]
})
export class AppDrawModule {}
