import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  inject
} from '@angular/core';

import { IgoLanguageModule } from '@igo2/core/language';

import { ContextFormComponent } from '../context-form/context-form.component';
import { Context } from '../shared/context.interface';

@Component({
  selector: 'igo-context-edit',
  templateUrl: './context-edit.component.html',
  imports: [ContextFormComponent, IgoLanguageModule]
})
export class ContextEditComponent {
  private cd = inject(ChangeDetectorRef);

  @Input()
  get context(): Context {
    return this._context;
  }
  set context(value: Context) {
    this._context = value;
    this.refresh();
  }
  private _context: Context;

  @Output() submitForm = new EventEmitter<Context>();

  refresh() {
    this.cd.detectChanges();
  }
}
