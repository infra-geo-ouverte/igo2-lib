import { Routes, RouterModule } from '@angular/router';

import { AppActionComponent } from './action.component';

const routes: Routes = [
  {
    path: 'action',
    component: AppActionComponent
  }
];

export const AppActionRoutingModule = RouterModule.forChild(routes);
