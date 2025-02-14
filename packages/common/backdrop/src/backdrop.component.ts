import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'igo-backdrop',
  templateUrl: './backdrop.component.html',
  styleUrls: ['./backdrop.component.scss'],
  imports: [NgClass]
})
export class BackdropComponent {
  @Input()
  get shown(): boolean {
    return this._shown;
  }
  set shown(value: boolean) {
    this._shown = value;
  }
  private _shown: boolean;
}
