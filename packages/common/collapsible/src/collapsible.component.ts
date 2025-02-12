import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { CollapseDirective } from './collapse.directive';

@Component({
    selector: 'igo-collapsible',
    templateUrl: './collapsible.component.html',
    styleUrls: ['./collapsible.component.scss'],
    imports: [MatListModule, MatIconModule, CollapseDirective]
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

  @Output() toggle = new EventEmitter<boolean>();
}
