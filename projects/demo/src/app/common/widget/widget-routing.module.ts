import { RouterModule, Routes } from '@angular/router';

import { AppWidgetComponent } from './widget.component';

const routes: Routes = [
  {
    path: 'widget',
    component: AppWidgetComponent
  }
];

export const AppWidgetRoutingModule = RouterModule.forChild(routes);
