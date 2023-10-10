import { Routes, RouterModule } from '@angular/router';

import { AppSpatialFilterComponent } from './spatial-filter.component';

const routes: Routes = [
  {
    path: 'spatial-filter',
    component: AppSpatialFilterComponent
  }
];

export const AppSpatialFilterRoutingModule = RouterModule.forChild(routes);
