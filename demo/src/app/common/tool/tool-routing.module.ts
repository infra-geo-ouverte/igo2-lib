import { Routes, RouterModule } from '@angular/router';

import { AppToolComponent } from './tool.component';

const routes: Routes = [
  {
    path: 'tool',
    component: AppToolComponent
  }
];

export const AppToolRoutingModule = RouterModule.forChild(routes);
