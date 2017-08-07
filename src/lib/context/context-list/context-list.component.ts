import { Component, Input, Output,
         EventEmitter, ChangeDetectorRef } from '@angular/core';

import { Context, ContextsList } from '../shared';


@Component({
  selector: 'igo-context-list',
  templateUrl: './context-list.component.html',
  styleUrls: ['./context-list.component.styl']
})
export class ContextListComponent {

  @Input()
  get contexts(): ContextsList { return this._contexts; }
  set contexts(value: ContextsList) {
    this._contexts = value;
  }
  private _contexts: ContextsList = {ours: []};

  @Input()
  get selectedContext(): Context { return this._selectedContext; }
  set selectedContext(value: Context) {
    this._selectedContext = value;
    this.cdRef.detectChanges();
  }
  private _selectedContext: Context;

  @Output() select = new EventEmitter<Context>();
  @Output() unselect = new EventEmitter<Context>();

  public titleMapping = {
      ours: 'Our contexts',
      shared: 'Shared contexts',
      public: 'Public contexts'
  }

  constructor(private cdRef: ChangeDetectorRef) {}

}
