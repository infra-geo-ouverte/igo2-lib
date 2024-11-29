import { NgIf } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { IgoLanguageModule } from '@igo2/core/language';

import { ContextFormComponent } from '../context-form/context-form.component';
import { Context } from '../shared/context.interface';

@Component({
  selector: 'igo-context-edit',
  templateUrl: './context-edit.component.html',
  standalone: true,
  imports: [NgIf, ContextFormComponent, IgoLanguageModule]
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

  @Output() submitForm = new EventEmitter<Context>();

  constructor(private cd: ChangeDetectorRef) {}

  refresh() {
    this.cd.detectChanges();
  }
}
