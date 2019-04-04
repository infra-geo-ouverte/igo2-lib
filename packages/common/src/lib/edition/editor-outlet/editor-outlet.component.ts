import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { Widget } from '../../widget';
import { Editor } from '../shared/editor';

/**
 * This component dynamically render an Editor's active widget.
 * It also deactivate that widget whenever the widget's component
 * emit the 'cancel' or 'complete' event.
 */
@Component({
  selector: 'igo-editor-outlet',
  templateUrl: './editor-outlet.component.html',
  styleUrls: ['./editor-outlet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorOutletComponent {

  /**
   * Editor
   */
  @Input() editor: Editor;

  /**
   * Event emitted when a widget is deactivate which happens
   * when the widget's component emits the 'cancel' or 'complete' event.
   */
  @Output() deactivateWidget = new EventEmitter<Widget>();

  /**
   * Observable of the editor's active widget
   * @internal
   */
  get widget$(): BehaviorSubject<Widget> { return this.editor.widget$; }

  /**
   * Observable of the editor's widget inputs
   * @internal
   */
  get widgetInputs$(): BehaviorSubject<{ [key: string]: any }> {
    return this.editor.widgetInputs$;
  }

  constructor() {}

  /**
   * When a widget's component emit the 'cancel' event,
   * deactivate that widget and emit the 'deactivateWidget' event.
   * @param widget Widget
   * @internal
   */
  onWidgetCancel(widget: Widget) {
    this.editor.deactivateWidget();
    this.deactivateWidget.emit(widget);
  }

  /**
   * When a widget's component emit the 'cancel' event,
   * deactivate that widget and emit the 'deactivateWidget' event.
   * @param widget Widget
   * @internal
   */
  onWidgetComplete(widget: Widget) {
    this.editor.deactivateWidget();
    this.deactivateWidget.emit(widget);
  }

}
