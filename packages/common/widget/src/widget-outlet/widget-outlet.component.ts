import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';

import {
  DynamicComponent,
  DynamicOutletComponent
} from '@igo2/common/dynamic-component';

import { WidgetComponent } from '../shared/widget.interfaces';

/**
 * This component dynamically renders a widget. It also subscribes
 * to the widget's 'cancel' and 'complete' events and destroys it
 * when any of those event is emitted.
 */
@Component({
  selector: 'igo-widget-outlet',
  templateUrl: './widget-outlet.component.html',
  styleUrls: ['./widget-outlet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, DynamicOutletComponent]
})
export class WidgetOutletComponent implements OnDestroy {
  /**
   * Widget subscribers to 'cancel' and 'complete'
   * @internal
   */
  private baseSubscribers = {
    cancel: (event: any) => this.onCancel(event),
    complete: (event: any) => this.onComplete(event)
  };

  /**
   * Widget
   */
  @Input() widget: DynamicComponent<WidgetComponent>;

  /**
   * Widget inputs
   */
  @Input() inputs: Record<string, any>;

  /**
   * Widget subscribers
   */
  @Input() subscribers: Record<string, (event: any) => void> = {};

  /**
   * Event emitted when the widget emits 'complete'
   */
  @Output() complete = new EventEmitter<any>();

  /**
   * Event emitted when the widget emits 'cancel'
   */
  @Output() cancel = new EventEmitter<any>();

  /**
   * Destroy the current widget and all it's inner subscriptions
   * @internal
   */
  ngOnDestroy() {
    this.destroyWidget();
  }

  /**
   * Get the effective subscribers. That means a combination of the base
   * subscribers and any subscriber given as input.
   * @returns Combined subscribers
   * @internal
   */
  getEffectiveSubscribers(): Record<string, (event: any) => void> {
    const subscribers = Object.assign({}, this.subscribers);

    // Base subscribers
    Object.keys(this.baseSubscribers).forEach((key: string) => {
      const subscriber = subscribers[key];
      const baseSubscriber = this.baseSubscribers[key];
      if (subscriber !== undefined) {
        subscribers[key] = (event: any) => {
          subscriber(event);
          baseSubscriber(event);
        };
      } else {
        subscribers[key] = baseSubscriber;
      }
    });

    return subscribers;
  }

  /**
   * When the widget emits 'cancel', propagate that event and destroy
   * the widget
   */
  private onCancel(event: any) {
    this.cancel.emit(event);
    this.destroyWidget();
  }

  /**
   * When the widget emits 'complete', propagate that event and destroy
   * the widget
   */
  private onComplete(event: any) {
    this.complete.emit(event);
    this.destroyWidget();
  }

  /**
   * Destroy the current widget
   */
  private destroyWidget() {
    if (this.widget !== undefined) {
      this.widget.destroy();
    }
    this.widget = undefined;
  }
}
