import { Directive, Self, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { ActivityService } from '@igo2/core';
import { SpinnerComponent } from './spinner.component';

@Directive({
  selector: '[igoSpinnerBinding]'
})
export class SpinnerBindingDirective implements OnInit, OnDestroy {
  private component: SpinnerComponent;
  private counter$$: Subscription;

  constructor(
    @Self() component: SpinnerComponent,
    private activityService: ActivityService
  ) {
    this.component = component;
  }

  ngOnInit() {
    this.counter$$ = this.activityService.counter$.subscribe(
      count => (this.component.shown = count > 0)
    );
  }

  ngOnDestroy() {
    this.counter$$.unsubscribe();
  }
}
