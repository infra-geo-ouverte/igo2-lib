import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppLanguageComponent } from './language.component';

const routes: Routes = [
  {
    path: 'language',
    component: AppLanguageComponent
  }
];

export const AppLanguageRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
