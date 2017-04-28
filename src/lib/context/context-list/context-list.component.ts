import { Component, Input, Output,
         EventEmitter, ChangeDetectorRef } from '@angular/core';

import { Context } from '../shared';


@Component({
  selector: 'igo-context-list',
  templateUrl: './context-list.component.html',
  styleUrls: ['./context-list.component.styl']
})
export class ContextListComponent {

  @Input()
  get contexts(): Context[] { return this._contexts; }
  set contexts(value: Context[]) {
    this._contexts = value;
  }
  private _contexts: Context[] = [];

  @Input()
  get selectedContext(): Context { return this._selectedContext; }
  set selectedContext(value: Context) {
    this._selectedContext = value;
    this.cdRef.detectChanges();
  }
  private _selectedContext: Context;

  @Output() select = new EventEmitter<Context>();
  @Output() unselect = new EventEmitter<Context>();

  constructor(private cdRef: ChangeDetectorRef) {}

}
