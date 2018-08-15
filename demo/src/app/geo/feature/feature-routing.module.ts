import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppFeatureComponent } from './feature.component';

const routes: Routes = [
  {
    path: 'feature',
    component: AppFeatureComponent
  }
];

export const AppFeatureRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
