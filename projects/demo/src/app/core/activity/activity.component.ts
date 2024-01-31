import { Component } from '@angular/core';

import { ActivityService } from '@igo2/core';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
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

  get counter(): number {
    return this.activityService.counter$.value;
  }
}
