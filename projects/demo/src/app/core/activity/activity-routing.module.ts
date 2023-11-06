import { RouterModule, Routes } from '@angular/router';

import { AppActivityComponent } from './activity.component';

const routes: Routes = [
  {
    path: 'activity',
    component: AppActivityComponent
  }
];

export const AppActivityRoutingModule = RouterModule.forChild(routes);
