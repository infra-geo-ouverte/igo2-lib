import { RouterModule, Routes } from '@angular/router';

import { AppDynamicComponentComponent } from './dynamic-component.component';

const routes: Routes = [
  {
    path: 'dynamic-component',
    component: AppDynamicComponentComponent
  }
];

export const AppDynamicComponentRoutingModule = RouterModule.forChild(routes);
