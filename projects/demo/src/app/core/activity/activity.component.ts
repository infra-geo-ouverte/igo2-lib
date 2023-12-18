import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { ActivityService } from '@igo2/core';

import { IgoSpinnerModule } from '../../../../../../packages/common/src/lib/spinner/spinner.module';
import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatButtonModule,
    IgoSpinnerModule
  ]
})
export class AppActivityComponent {
  private idsActivity: string[] = [];

  constructor(private activityService: ActivityService) {}

  register() {
    this.idsActivity.push(this.activityService.register());
  }

  unregister() {
    this.activityService.unregister(this.idsActivity.pop());
  }

  get counter() {
    return this.activityService.counter$.value;
  }
}
