import { RouterModule, Routes } from '@angular/router';

import { AppHomeComponent } from './home.component';

const routes: Routes = [
  {
    path: 'home',
    component: AppHomeComponent
  }
];

export const AppHomeRoutingModule = RouterModule.forChild(routes);
