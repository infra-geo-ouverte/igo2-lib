import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input
} from '@angular/core';
import { NgIf, NgClass } from '@angular/common';

@Component({
    selector: 'igo-panel',
    templateUrl: './panel.component.html',
    styleUrls: ['./panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, NgClass]
})
export class PanelComponent {
  @Input() title: string;

  @Input()
  @HostBinding('class.igo-panel-with-header')
  get withHeader(): boolean {
    return this._withHeader;
  }
  set withHeader(value: boolean) {
    this._withHeader = value;
  }
  private _withHeader = true;

  @Input() cursorPointer: boolean = false;
}
