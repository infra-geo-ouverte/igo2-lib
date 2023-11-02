import { NgModule } from '@angular/core';

import { provideMonitoring } from '@igo2/core';

import { environment } from 'demo/src/environments/environment';

import { SharedModule } from '../../shared/shared.module';
import { MonitoringRoutingModule } from './monitoring-routing.module';
import { MonitoringComponent } from './monitoring.component';

@NgModule({
  declarations: [MonitoringComponent],
  imports: [SharedModule, MonitoringRoutingModule],
  providers: [
    ...provideMonitoring(environment.igo.monitoring, environment.production)
  ]
})
export class MonitoringModule {}
