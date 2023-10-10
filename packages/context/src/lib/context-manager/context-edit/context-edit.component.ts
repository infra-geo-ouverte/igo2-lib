import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';

import { Context } from '../shared/context.interface';

@Component({
  selector: 'igo-context-edit',
  templateUrl: './context-edit.component.html'
})
export class ContextEditComponent {
  @Input()
  get context(): Context {
    return this._context;
  }
  set context(value: Context) {
    this._context = value;
    this.refresh();
  }
  private _context: Context;

  @Output() submitForm: EventEmitter<Context> = new EventEmitter();

  constructor(private cd: ChangeDetectorRef) {}

  refresh() {
    this.cd.detectChanges();
  }
}
