import { Routes, RouterModule } from '@angular/router';

import { AppTableComponent } from './table.component';

const routes: Routes = [
  {
    path: 'table',
    component: AppTableComponent
  }
];

export const AppTableRoutingModule = RouterModule.forChild(routes);
