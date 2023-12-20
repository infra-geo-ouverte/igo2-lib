import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { Context } from '../shared/context.interface';
import { TranslateModule } from '@ngx-translate/core';
import { ContextFormComponent } from '../context-form/context-form.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'igo-context-edit',
    templateUrl: './context-edit.component.html',
    standalone: true,
    imports: [NgIf, ContextFormComponent, TranslateModule]
})
export class ContextEditComponent {
  @Input()
  get context(): Context {
    return this._context;
  }
  set context(value: Context) {
    this._context = value;
    this.refresh();
  }
  private _context: Context;

  @Output() submitForm: EventEmitter<Context> = new EventEmitter();

  constructor(private cd: ChangeDetectorRef) {}

  refresh() {
    this.cd.detectChanges();
  }
}
