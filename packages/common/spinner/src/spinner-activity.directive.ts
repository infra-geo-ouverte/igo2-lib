import { Directive, OnDestroy, OnInit, inject } from '@angular/core';

import { ActivityService } from '@igo2/core/activity';

import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { SpinnerComponent } from './spinner.component';

/**
 * A directive to bind a SpinnerComponent to the activity service.
 * The activity service tracks any HTTP request and this directive
 * will display the spinner it's attached to when the activity counter
 * is greater than 0.
 */
@Directive({
  selector: '[igoSpinnerActivity]',
  standalone: true
})
export class SpinnerActivityDirective implements OnInit, OnDestroy {
  private spinner = inject(SpinnerComponent, { self: true });
  private activityService = inject(ActivityService);

  /**
   * Subscription to the activity service counter
   */
  private counter$$: Subscription;

  /**
   * Subscribe to the activity service counter and display the spinner
   * when it's is greater than 0.
   * @internal
   */
  ngOnInit() {
    this.counter$$ = this.activityService.counter$
      .pipe(debounceTime(50))
      .subscribe((count: number) => {
        count > 0 ? this.spinner.show() : this.spinner.hide();
      });
  }

  /**
   * Unsubcribe to the activity service counter.
   * @internal
   */
  ngOnDestroy() {
    this.counter$$.unsubscribe();
  }
}
