import { Component, Input, Output,
         EventEmitter, HostBinding } from '@angular/core';

import { Tool } from '../shared/tool.interface';

@Component({
  selector: 'igo-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.styl']
})
export class ToolbarComponent {

  @Input()
  get tools(): Tool[] { return this._tools; }
  set tools(value: Tool[]) {
    this._tools = value;
  }
  private _tools: Tool[] = [];

  @Input()
  get horizontal() { return this._horizontal; }
  set horizontal(value: boolean) {
    this._horizontal = value;
  }
  private _horizontal: boolean = false;

  @Input()
  get withTitle() { return this._withTitle; }
  set withTitle(value: boolean) {
    this._withTitle = value;
  }
  private _withTitle: boolean = true;

  @Input()
  get withIcon() { return this._withIcon; }
  set withIcon(value: boolean) {
    this._withIcon = value;
  }
  private _withIcon: boolean = true;

  @Output() select = new EventEmitter<Tool>();
  @Output() test = new EventEmitter<Tool>();

  @HostBinding('class.withTitle')
  get withTitleClass() { return this.withTitle; }

  @HostBinding('class.withIcon')
  get withIconClass() { return this.withIcon; }

  @HostBinding('class.horizontal')
  get horizontalClass() { return this.horizontal; }

  constructor() {}

}
