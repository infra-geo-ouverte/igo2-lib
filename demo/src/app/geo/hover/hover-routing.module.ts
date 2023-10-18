import { RouterModule, Routes } from '@angular/router';

import { AppHoverComponent } from './hover.component';

const routes: Routes = [
  {
    path: 'hover',
    component: AppHoverComponent
  }
];

export const AppHoverRoutingModule = RouterModule.forChild(routes);
