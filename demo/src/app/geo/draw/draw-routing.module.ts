import { Routes, RouterModule } from '@angular/router';

import { AppDrawComponent } from './draw.component';

const routes: Routes = [
  {
    path: 'draw',
    component: AppDrawComponent
  }
];

export const AppDrawRoutingModule = RouterModule.forChild(
  routes
);
