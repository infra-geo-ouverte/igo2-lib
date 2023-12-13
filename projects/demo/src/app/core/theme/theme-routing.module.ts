import { RouterModule, Routes } from '@angular/router';

import { AppThemeComponent } from './theme.component';

const routes: Routes = [
  {
    path: 'theme',
    component: AppThemeComponent
  }
];

export const AppRequestThemeModule = RouterModule.forChild(routes);
