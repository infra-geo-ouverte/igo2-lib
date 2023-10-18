import { RouterModule, Routes } from '@angular/router';

import { AppAuthFormComponent } from './auth-form.component';

const routes: Routes = [
  {
    path: 'auth-form',
    component: AppAuthFormComponent
  }
];

export const AppAuthFormRoutingModule = RouterModule.forChild(routes);
