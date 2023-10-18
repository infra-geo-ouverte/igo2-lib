import { RouterModule, Routes } from '@angular/router';

import { AppQueryComponent } from './query.component';

const routes: Routes = [
  {
    path: 'query',
    component: AppQueryComponent
  }
];

export const AppQueryRoutingModule = RouterModule.forChild(routes);
