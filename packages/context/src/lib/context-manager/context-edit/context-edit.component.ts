import { Component, model, output } from '@angular/core';

import { IgoLanguageModule } from '@igo2/core/language';

import { ContextFormComponent } from '../context-form/context-form.component';
import { Context } from '../shared/context.interface';

@Component({
  selector: 'igo-context-edit',
  templateUrl: './context-edit.component.html',
  imports: [ContextFormComponent, IgoLanguageModule]
})
export class ContextEditComponent {
  readonly context = model<Context>(undefined);
  readonly submitForm = output<Context>();
}
