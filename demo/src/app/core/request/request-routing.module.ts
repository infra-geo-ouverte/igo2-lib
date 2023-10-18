import { RouterModule, Routes } from '@angular/router';

import { AppRequestComponent } from './request.component';

const routes: Routes = [
  {
    path: 'request',
    component: AppRequestComponent
  }
];

export const AppRequestRoutingModule = RouterModule.forChild(routes);
