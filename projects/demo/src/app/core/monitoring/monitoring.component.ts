import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import {
  AnyMonitoringOptions,
  MONITORING_OPTIONS
} from '@igo2/core/monitoring';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss'],
  providers: [JsonPipe],
  imports: [DocViewerComponent, ExampleViewerComponent, MatButtonModule]
})
export class AppMonitoringComponent {
  options = inject<AnyMonitoringOptions | null>(MONITORING_OPTIONS);
  private json = inject(JsonPipe);

  exampleProviderCode: string = EXAMPLE_PROVIDER;

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

const EXAMPLE_PROVIDER = `bootstrapApplication(AppComponent, {
  providers: [
    ...provideSentryMonitoring(environment.igo.monitoring),

    // Provide the authentication user monitoring if you want to identify your user (id, fullname, email) in the error logging
    ...provideAuthUserMonitoring(environment.igo.monitoring)
  ]
})
`;
