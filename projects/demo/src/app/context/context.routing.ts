import { Routes } from '@angular/router';

import { AppContextComponent } from './context/context.component';

export const routes: Routes = [
  { path: '', redirectTo: 'context', pathMatch: 'full' },
  {
    title: 'Context',
    path: 'context',
    component: AppContextComponent
  }
];
