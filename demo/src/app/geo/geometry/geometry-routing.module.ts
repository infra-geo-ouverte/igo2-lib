import { RouterModule, Routes } from '@angular/router';

import { AppGeometryComponent } from './geometry.component';

const routes: Routes = [
  {
    path: 'geometry',
    component: AppGeometryComponent
  }
];

export const AppGeometryRoutingModule = RouterModule.forChild(routes);
