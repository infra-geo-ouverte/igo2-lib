import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'igo-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {

  public shown$ = new Subject<boolean>();

  @Input()
  set shown(value: boolean) {
    this.shown$.next(value);
  }

  constructor() {}

  show() {
    this.shown = true;
  }

  hide() {
    this.shown = false;
  }
}
