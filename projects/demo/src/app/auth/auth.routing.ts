import { Routes } from '@angular/router';

import { AppAuthFormComponent } from './auth-form/auth-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'form', pathMatch: 'full' },
  {
    title: 'Authentification',
    path: 'form',
    component: AppAuthFormComponent
  }
];
