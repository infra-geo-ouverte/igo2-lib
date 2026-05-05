import { EventEmitter, OutputEmitterRef } from '@angular/core';

/**
 * This is the interface a widget component needs to implement. A widget
 * component is component that can be created dynamically. It needs
 * to emit the 'complete' and 'cancel' event at some time in it's lifecycle.
 * Since a widget's inputs are set manually, you may want to implement the 'onUpdateInputs'
 * method. This method could, for example, trigger the change detection.
 */
export interface WidgetComponent {
  complete: EventEmitter<any> | OutputEmitterRef<any>;
  cancel: EventEmitter<any> | OutputEmitterRef<any>;
}
