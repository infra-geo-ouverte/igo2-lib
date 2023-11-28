import { NgModule } from '@angular/core';

import { provideMonitoring } from '@igo2/core';

import { environment } from 'demo/src/environments/environment';
import { provideAuthUserMonitoring } from 'packages/auth/src/lib/auth-monitoring/auth-monitoring.provider';

import { SharedModule } from '../../shared/shared.module';
import { MonitoringRoutingModule } from './monitoring-routing.module';
import { MonitoringComponent } from './monitoring.component';

@NgModule({
  declarations: [MonitoringComponent],
  imports: [SharedModule, MonitoringRoutingModule],
  providers: [
    ...provideMonitoring(environment.igo.monitoring),
    ...provideAuthUserMonitoring(environment.igo.monitoring)
  ]
})
export class MonitoringModule {}
