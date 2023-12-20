import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

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
  imports: [AppDrawComponent, RoutingModule]
})
export class AppDrawModule {}
