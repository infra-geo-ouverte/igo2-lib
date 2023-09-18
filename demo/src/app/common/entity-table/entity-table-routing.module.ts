import { Routes, RouterModule } from '@angular/router';

import { AppEntityTableComponent } from './entity-table.component';

const routes: Routes = [
  {
    path: 'entity-table',
    component: AppEntityTableComponent
  }
];

export const AppEntityTableRoutingModule = RouterModule.forChild(routes);
