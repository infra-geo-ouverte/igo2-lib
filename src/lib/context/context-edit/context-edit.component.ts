import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Context } from '../shared';


@Component({
  selector: 'igo-context-edit',
  templateUrl: './context-edit.component.html',
  styleUrls: ['./context-edit.component.styl']
})
export class ContextEditComponent {

  @Input()
  get context(): Context { return this._context; }
  set context(value: Context) {
    this._context = value;
  }
  private _context: Context;

  // @Output() submit: EventEmitter<ContextOptions> = new EventEmitter();
  @Output() submitForm: EventEmitter<any> = new EventEmitter();

  constructor() {}

}
