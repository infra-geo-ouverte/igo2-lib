import { Routes, RouterModule } from '@angular/router';

import { AppOgcFilterComponent } from './ogc-filter.component';

const routes: Routes = [
  {
    path: 'ogc-filter',
    component: AppOgcFilterComponent
  }
];

export const AppOgcFilterRoutingModule = RouterModule.forChild(routes);
