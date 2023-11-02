import { NgModule } from '@angular/core';
import { MonitoringComponent } from './monitoring.component';
import { SharedModule } from '../../shared/shared.module';
import { MonitoringRoutingModule } from './monitoring-routing.module';
import { provideMonitoring } from '@igo2/core';
import { environment } from 'demo/src/environments/environment';

@NgModule({
  declarations: [MonitoringComponent],
  imports: [SharedModule, MonitoringRoutingModule],
  providers: [...provideMonitoring(environment)]
})
export class MonitoringModule {}
