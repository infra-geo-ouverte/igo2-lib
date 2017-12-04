import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ObjectUtils } from '../../utils';
import { Context } from '../shared';

@Component({
  selector: 'igo-context-form',
  templateUrl: './context-form.component.html',
  styleUrls: ['./context-form.component.styl']
})
export class ContextFormComponent implements OnInit {
  public form: FormGroup;
  public prefix: string;

  @Input()
  get btnSubmitText(): string { return this._btnSubmitText; }
  set btnSubmitText(value: string) {
    this._btnSubmitText = value;
  }
  private _btnSubmitText: string;

  @Input()
  get context(): Context { return this._context; }
  set context(value: Context) {
    this._context = value;
    this.buildForm();
  }
  private _context: Context;

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = value;
  }
  private _disabled: boolean = false;

  // TODO: replace any by ContextOptions or Context
  @Output() submitForm: EventEmitter<any> = new EventEmitter();
  @Output() clone: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.buildForm();
  }

  public handleFormSubmit(value) {
    value = ObjectUtils.removeNull(value);
    value.uri = value.uri.replace(' ', '');
    if (value.uri) {
      value.uri = this.prefix + '-' + value.uri;
    } else {
      value.uri = this.prefix;
    }
    this.submitForm.emit(value);
  }

  private buildForm(): void {
    const context: any = this.context || {};

    const uriSplit = context.uri.split('-');
    this.prefix = uriSplit.shift();
    const uri = uriSplit.join('-');

    this.form = this.formBuilder.group({
      'title': [context.title],
      'uri': [uri || ' ']
    });
  }

}
