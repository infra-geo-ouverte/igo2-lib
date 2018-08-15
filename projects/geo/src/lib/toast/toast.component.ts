import { Component, Input, Output, EventEmitter } from '@angular/core';

import { FlexibleState } from '@igo2/common';
import { Feature } from '../feature/shared/feature.interface';

@Component({
  selector: 'igo-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  static SWIPE_ACTION = {
    UP: 'swipeup',
    DOWN: 'swipedown'
  };

  @Input()
  get expanded(): boolean {
    return this._expanded;
  }
  set expanded(value: boolean) {
    this.state = value ? 'expanded' : 'collapsed';
    this._expanded = value;
  }
  private _expanded: boolean;

  @Input()
  get feature(): Feature {
    return this._feature;
  }
  set feature(value: Feature) {
    this._feature = value;
  }
  private _feature: Feature;

  @Output() opened = new EventEmitter<boolean>();

  public state: FlexibleState;

  constructor() {}

  toggle() {
    this.expanded = !this.expanded;
    this.opened.emit(this.expanded);
  }

  swipe(action: string) {
    if (action === ToastComponent.SWIPE_ACTION.UP) {
      if (!this.expanded) {
        this.toggle();
      }
    } else if (action === ToastComponent.SWIPE_ACTION.DOWN) {
      if (this.expanded) {
        this.toggle();
      }
    }
  }
}
