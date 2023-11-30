import { Routes, RouterModule } from '@angular/router';
import { MonitoringComponent } from './monitoring.component';

const routes: Routes = [
  {
    path: 'monitoring',
    component: MonitoringComponent
  }
];

export const MonitoringRoutingModule = RouterModule.forChild(routes);
