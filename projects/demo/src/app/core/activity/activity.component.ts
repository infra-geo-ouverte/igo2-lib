import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { SpinnerComponent } from '@igo2/common/spinner';
import { ActivityService } from '@igo2/core/activity';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    SpinnerComponent,
    MatButtonModule
  ]
})
export class AppActivityComponent {
  private activityService = inject(ActivityService);

  private idsActivity: string[] = [];

  register() {
    this.idsActivity.push(this.activityService.register());
  }

  unregister() {
    this.activityService.unregister(this.idsActivity.pop());
  }

  get counter(): number {
    return this.activityService.counter$.value;
  }
}
