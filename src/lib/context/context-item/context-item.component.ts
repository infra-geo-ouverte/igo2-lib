import { Component, Input } from '@angular/core';

import { Context } from '../shared/context.interface';

@Component({
  selector: 'igo-context-item',
  templateUrl: './context-item.component.html',
  styleUrls: ['./context-item.component.styl']
})
export class ContextItemComponent {

  @Input()
  get context(): Context { return this._context; }
  set context(value: Context) {
    this._context = value;
  }
  private _context: Context;

  constructor() { }

}
