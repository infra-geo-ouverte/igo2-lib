import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';

import { DynamicComponent } from '../../dynamic-component';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetOutletComponent implements OnDestroy {

  /**
   * Widget subscribers to 'cancel' and 'complete'
   * @internal
   */
  readonly subscribers = {
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
  @Input() inputs: {[key: string]: any};

  /**
   * Event emitted when the widget emits 'complete'
   */
  @Output() complete = new EventEmitter<any>();

  /**
   * Event emitted when the widget emits 'cancel'
   */
  @Output() cancel = new EventEmitter<any>();

  constructor() {}

  /**
   * Destroy the current widget and all it's inner subscriptions
   * @internal
   */
  ngOnDestroy() {
    this.destroyWidget();
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
