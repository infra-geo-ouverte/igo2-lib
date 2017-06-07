import { Component, Input } from '@angular/core';

import { Options } from 'angular2-notifications/src/simple-notifications.module';


@Component({
  selector: 'igo-message-center',
  templateUrl: './message-center.component.html',
  styleUrls: ['./message-center.component.styl'],
})

export class MessageCenterComponent {

  static defaultOptions = {
    timeOut: 5000,
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: true,
    maxLength: 100,
    maxStack: 3,
    preventDuplicates: true
  };

  @Input()
  get options(): Options {
    return Object.assign(
      {}, MessageCenterComponent.defaultOptions, this._options);
  }
  set options(value: Options) {
    this._options = value;
  }
  private _options: Options = '';

  constructor() { }

}
