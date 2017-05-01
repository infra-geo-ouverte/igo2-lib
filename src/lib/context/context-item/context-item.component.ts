import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Context } from '../shared/context.interface';

@Component({
  selector: 'igo-context-item',
  templateUrl: './context-item.component.html',
  styleUrls: ['./context-item.component.styl']
})
export class ContextItemComponent {

  @Input() context: Context;
  @Input() edition: boolean = true;

  @Output() editContext: EventEmitter<Context> = new EventEmitter();

  handleEditButtonClick(event: MouseEvent) {
    event.stopPropagation();
    this.editContext.emit(this.context);
  }

  constructor() { }

}
