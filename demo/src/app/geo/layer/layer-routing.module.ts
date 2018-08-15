import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppLayerComponent } from './layer.component';

const routes: Routes = [
  {
    path: 'layer',
    component: AppLayerComponent
  }
];

export const AppLayerRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
