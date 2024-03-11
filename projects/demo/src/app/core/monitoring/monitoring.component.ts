import { JsonPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { provideAuthUserMonitoring } from '@igo2/auth';
import {
  AnyMonitoringOptions,
  MONITORING_OPTIONS,
  provideMonitoring
} from '@igo2/core/monitoring';

import { environment } from 'projects/demo/src/environments/environment';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss'],
  providers: [
    JsonPipe,
    ...provideMonitoring(environment.igo.monitoring),
    ...provideAuthUserMonitoring(environment.igo.monitoring)
  ],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent, MatButtonModule]
})
export class AppMonitoringComponent {
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
  }
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
