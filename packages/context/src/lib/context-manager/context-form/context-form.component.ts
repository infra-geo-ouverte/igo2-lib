import { Clipboard } from '@angular/cdk/clipboard';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import { ObjectUtils } from '@igo2/utils';

import { Context } from '../shared/context.interface';

@Component({
  selector: 'igo-context-form',
  templateUrl: './context-form.component.html',
  styleUrls: ['./context-form.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    IgoLanguageModule
  ]
})
export class ContextFormComponent implements OnInit {
  private clipboard = inject(Clipboard);
  private formBuilder = inject(UntypedFormBuilder);
  private messageService = inject(MessageService);

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
  @Output() submitForm = new EventEmitter<any>();
  @Output() clone = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

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
    const successful = this.clipboard.copy(text);
    if (successful) {
      this.messageService.success(
        'igo.context.contextManager.dialog.copyMsg',
        'igo.context.contextManager.dialog.copyTitle'
      );
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
