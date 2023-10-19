import { RouterModule, Routes } from '@angular/router';

import { AppLegendComponent } from './legend.component';

const routes: Routes = [
  {
    path: 'legend',
    component: AppLegendComponent
  }
];

export const AppLegendRoutingModule = RouterModule.forChild(routes);
