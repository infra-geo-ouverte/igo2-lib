import { JsonPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';

import { AnyMonitoringOptions, MONITORING_OPTIONS } from '@igo2/core';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss'],
  providers: [JsonPipe]
})
export class MonitoringComponent {
  exampleModuleCode: string = EXAMPLE_MODULE_PROVIDER;
  constructor(
    @Inject(MONITORING_OPTIONS)
    public options: AnyMonitoringOptions | null,
    private json: JsonPipe
  ) {}

  throwTestError(): void {
    throw new Error('Sentry Test Error');
  }

  getBasicConfigExample(): string {
    const codeExample = `{"igo": {"monitoring": ${JSON.stringify(
      this.options,
      null,
      2
    )}}}`;
    return this.json.transform(JSON.parse(codeExample));
  };
}

const EXAMPLE_MODULE_PROVIDER = `@NgModule({
  declarations: [...],
  imports: [...],
  providers: [
    ...provideMonitoring(environment.igo.monitoring),

    // Provide the authentication user monitoring if you want to identify your user (id, fullname, email) in the error logging 
    ...provideAuthUserMonitoring(environment.igo.monitoring)
  ]
})
`;
