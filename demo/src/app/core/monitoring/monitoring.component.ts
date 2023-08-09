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

  getBasicConfigExample = () => {
    const codeExample = `{"igo": {"monitoring": ${JSON.stringify(
      this.options,
      null,
      2
    )}}}`;
    return this.json.transform(JSON.parse(codeExample));
  };
}

const EXAMPLE_MODULE_PROVIDER = `@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...,
    AuthModule // *Required only if you enable "identifyUser" in the monitoring options
  ],
  providers: [
    ...provideMonitoring(environment)
  ]
})
`;
