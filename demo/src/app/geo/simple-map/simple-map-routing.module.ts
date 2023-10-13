import { RouterModule, Routes } from '@angular/router';

import { AppSimpleMapComponent } from './simple-map.component';

const routes: Routes = [
  {
    path: 'simple-map',
    component: AppSimpleMapComponent
  }
];

export const AppSimpleMapRoutingModule = RouterModule.forChild(routes);
