import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'igo-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelComponent {
  @Input()
  get title() {
    return this._title;
  }
  set title(value: string) {
    this._title = value;
  }
  private _title: string;

  constructor() {}
}
