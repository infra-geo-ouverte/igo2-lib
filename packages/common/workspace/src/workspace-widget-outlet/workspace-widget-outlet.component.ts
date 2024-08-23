import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { Widget, WidgetOutletComponent } from '@igo2/common/widget';

import { BehaviorSubject } from 'rxjs';

import { Workspace } from '../shared/workspace';

/**
 * This component dynamically render an Workspace's active widget.
 * It also deactivate that widget whenever the widget's component
 * emit the 'cancel' or 'complete' event.
 */
@Component({
  selector: 'igo-workspace-widget-outlet',
  templateUrl: './workspace-widget-outlet.component.html',
  styleUrls: ['./workspace-widget-outlet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, WidgetOutletComponent, AsyncPipe]
})
export class WorkspaceWidgetOutletComponent {
  /**
   * Workspace
   */
  @Input() workspace: Workspace;

  /**
   * Event emitted when a widget is deactivate which happens
   * when the widget's component emits the 'cancel' or 'complete' event.
   */
  @Output() deactivateWidget = new EventEmitter<Widget>();

  /**
   * Observable of the workspace's active widget
   * @internal
   */
  get widget$(): BehaviorSubject<Widget> {
    return this.workspace.widget$;
  }

  /**
   * Observable of the workspace's widget inputs
   * @internal
   */
  get widgetInputs$(): BehaviorSubject<Record<string, any>> {
    return this.workspace.widgetInputs$;
  }

  /**
   * Observable of the workspace's widget inputs
   * @internal
   */
  get widgetSubscribers$(): BehaviorSubject<Record<string, (event: any) => void>> {
    return this.workspace.widgetSubscribers$;
  }

  constructor() {}

  /**
   * When a widget's component emit the 'cancel' event,
   * deactivate that widget and emit the 'deactivateWidget' event.
   * @param widget Widget
   * @internal
   */
  onWidgetCancel(widget: Widget) {
    this.workspace.deactivateWidget();
    this.deactivateWidget.emit(widget);
  }

  /**
   * When a widget's component emit the 'cancel' event,
   * deactivate that widget and emit the 'deactivateWidget' event.
   * @param widget Widget
   * @internal
   */
  onWidgetComplete(widget: Widget) {
    this.workspace.deactivateWidget();
    this.deactivateWidget.emit(widget);
  }
}
