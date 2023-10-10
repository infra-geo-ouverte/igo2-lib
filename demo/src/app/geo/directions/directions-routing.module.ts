import { Routes, RouterModule } from '@angular/router';

import { AppDirectionsComponent } from './directions.component';

const routes: Routes = [
  {
    path: 'directions',
    component: AppDirectionsComponent
  }
];

export const AppDirectionsRoutingModule = RouterModule.forChild(routes);
