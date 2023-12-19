import { RouterModule, Routes } from '@angular/router';

import { AppMeasureComponent } from './measure.component';

const routes: Routes = [
  {
    path: 'measure',
    component: AppMeasureComponent
  }
];

export const AppMeasureRoutingModule = RouterModule.forChild(routes);
