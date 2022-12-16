import {
  Component,
  Input,
  ChangeDetectionStrategy,
  HostBinding
} from '@angular/core';

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

  @Input()
  @HostBinding('class.igo-panel-with-header')
  get withHeader(): boolean {
    return this._withHeader;
  }
  set withHeader(value: boolean) {
    this._withHeader = value;
  }
  private _withHeader = true;

  @Input()
  get cursorPointer() {
    return this._cursorPointer;
  }
  set cursorPointer(value: boolean) {
    this._cursorPointer = value;
  }
  private _cursorPointer: boolean = false;
}
