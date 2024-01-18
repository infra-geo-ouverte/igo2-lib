import { AsyncPipe, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'igo-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  standalone: true,
  imports: [NgClass, MatProgressSpinner, AsyncPipe]
})
export class SpinnerComponent {
  public shown$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Input()
  set shown(value: boolean) {
    this.shown$.next(value);
  }
  get shown(): boolean {
    return this.shown$.value;
  }

  constructor() {}

  show() {
    this.shown = true;
  }

  hide() {
    this.shown = false;
  }
}
