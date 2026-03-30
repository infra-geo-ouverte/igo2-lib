import { Clipboard } from '@angular/cdk/clipboard';
import { Component, computed, inject, input, output } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder
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
export class ContextFormComponent {
  private clipboard = inject(Clipboard);
  private formBuilder = inject(UntypedFormBuilder);
  private messageService = inject(MessageService);

  public prefix: string;

  readonly btnSubmitText = input<string>();
  readonly context = input<Context>();
  readonly disabled = input(false);

  readonly submitForm = output<unknown>();
  readonly clone = output<unknown>();
  readonly delete = output<unknown>();

  // WORKAROUND, the context-form is shown before the editedContext emit and we got change detection problem
  readonly form = computed<FormGroup | undefined>(() => {
    const context = this.context();
    if (context) {
      return this.buildForm(context);
    }
  });

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
    const text = this.prefix + '-' + this.form().value.uri.replace(' ', '');
    const successful = this.clipboard.copy(text);
    if (successful) {
      this.messageService.success(
        'igo.context.contextManager.dialog.copyMsg',
        'igo.context.contextManager.dialog.copyTitle'
      );
    }
  }

  private buildForm(context: Context): FormGroup {
    const uriSplit = context.uri.split('-');
    this.prefix = uriSplit.shift();
    const uri = uriSplit.join('-');

    return this.formBuilder.group({
      title: [context.title],
      uri: [uri || ' ']
    });
  }
}
