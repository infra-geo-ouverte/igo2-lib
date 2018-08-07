import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { AppOverlayComponent } from './overlay.component';

const routes: Routes = [
  {
    path: 'overlay',
    component: AppOverlayComponent
  }
];

export const AppOverlayRoutingModule: ModuleWithProviders = RouterModule.forChild(
  routes
);
