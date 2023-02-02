import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'igo-collapsible',
  templateUrl: './collapsible.component.html',
  styleUrls: ['./collapsible.component.scss']
})
export class CollapsibleComponent {
  @Input()
  get title() {
    return this._title;
  }
  set title(value: string) {
    this._title = value;
  }
  private _title = '';

  @Input()
  get collapsed() {
    return this._collapsed;
  }
  set collapsed(value: boolean) {
    this._collapsed = value;
    this.toggle.emit(value);
  }
  private _collapsed = false;

  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
}
