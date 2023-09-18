import { Routes, RouterModule } from '@angular/router';

import { AppLanguageComponent } from './language.component';

const routes: Routes = [
  {
    path: 'language',
    component: AppLanguageComponent
  }
];

export const AppLanguageRoutingModule = RouterModule.forChild(routes);
