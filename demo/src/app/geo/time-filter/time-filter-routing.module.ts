import { RouterModule, Routes } from '@angular/router';

import { AppTimeFilterComponent } from './time-filter.component';

const routes: Routes = [
  {
    path: 'time-filter',
    component: AppTimeFilterComponent
  }
];

export const AppTimeFilterRoutingModule = RouterModule.forChild(routes);
