import { RouterModule, Routes } from '@angular/router';

import { AppFormComponent } from './form.component';

const routes: Routes = [
  {
    path: 'form',
    component: AppFormComponent
  }
];

export const AppFormRoutingModule = RouterModule.forChild(routes);
