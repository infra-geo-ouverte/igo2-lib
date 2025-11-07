import { AsyncPipe, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'igo-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  imports: [NgClass, MatProgressSpinner, AsyncPipe]
})
export class SpinnerComponent {
  public shown$ = new BehaviorSubject<boolean>(false);

  @Input()
  set shown(value: boolean) {
    this.shown$.next(value);
  }
  get shown(): boolean {
    return this.shown$.value;
  }

  show() {
    this.shown = true;
  }

  hide() {
    this.shown = false;
  }
}
