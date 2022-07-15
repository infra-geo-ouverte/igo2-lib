import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { ObjectUtils, Clipboard } from '@igo2/utils';
import { MessageService, LanguageService } from '@igo2/core';
import { Context } from '../shared/context.interface';

@Component({
  selector: 'igo-context-form',
  templateUrl: './context-form.component.html',
  styleUrls: ['./context-form.component.scss']
})
export class ContextFormComponent implements OnInit {
  public form: UntypedFormGroup;
  public prefix: string;

  @Input()
  get btnSubmitText(): string {
    return this._btnSubmitText;
  }
  set btnSubmitText(value: string) {
    this._btnSubmitText = value;
  }
  private _btnSubmitText: string;

  @Input()
  get context(): Context {
    return this._context;
  }
  set context(value: Context) {
    this._context = value;
    this.buildForm();
  }
  private _context: Context;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }
  private _disabled = false;

  // TODO: replace any by ContextOptions or Context
  @Output() submitForm: EventEmitter<any> = new EventEmitter();
  @Output() clone: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private languageService: LanguageService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  public handleFormSubmit(value) {
    let inputs = Object.assign({}, value);
    inputs = ObjectUtils.removeNull(inputs);
    inputs.uri = inputs.uri.replace(' ', '');
    if (inputs.uri) {
      inputs.uri = this.prefix + '-' + inputs.uri;
    } else {
      inputs.uri = this.prefix;
    }
    this.submitForm.emit(inputs);
  }

  public copyTextToClipboard() {
    const text = this.prefix + '-' + this.form.value.uri.replace(' ', '');
    const successful = Clipboard.copy(text);
    if (successful) {
      const translate = this.languageService.translate;
      const title = translate.instant(
        'igo.context.contextManager.dialog.copyTitle'
      );
      const msg = translate.instant(
        'igo.context.contextManager.dialog.copyMsg'
      );
      this.messageService.success(msg, title);
    }
  }

  private buildForm(): void {
    const context: any = this.context || {};

    const uriSplit = context.uri.split('-');
    this.prefix = uriSplit.shift();
    const uri = uriSplit.join('-');

    this.form = this.formBuilder.group({
      title: [context.title],
      uri: [uri || ' ']
    });
  }
}
