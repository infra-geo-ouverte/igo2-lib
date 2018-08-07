import { Component, Input } from '@angular/core';

@Component({
  selector: 'igo-message-center',
  templateUrl: './message-center.component.html',
  styleUrls: ['./message-center.component.scss']
})
export class MessageCenterComponent {
  static defaultOptions = {
    timeOut: 5000,
    hasCloseIcon: false,
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: true,
    maxLength: 100,
    maxStack: 3,
    preventDuplicates: true
  };

  @Input()
  get options(): any {
    return Object.assign(
      {},
      MessageCenterComponent.defaultOptions,
      this._options
    );
  }
  set options(value: any) {
    this._options = value;
  }
  private _options: any = {};

  constructor() {}
}
