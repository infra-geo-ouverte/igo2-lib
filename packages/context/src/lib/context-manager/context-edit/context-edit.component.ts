import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';

import { ContextFormComponent } from '../context-form/context-form.component';
import { ContextService } from '../shared';
import { Context } from '../shared/context.interface';

@Component({
  selector: 'igo-context-edit',
  imports: [ContextFormComponent, IgoLanguageModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './context-edit.component.html'
})
export class ContextEditComponent {
  private contextService = inject(ContextService);
  private messageService = inject(MessageService);

  readonly context = toSignal(this.contextService.editedContext$);

  readonly submitSuccessed = output<Context>();

  onEdit(context: Context) {
    const id = this.context()?.id;
    if (!id) {
      throw new Error('Context id is required to update context');
    }
    this.contextService.update(id, context).subscribe(() => {
      this.messageService.success(
        'igo.context.contextManager.dialog.saveMsg',
        'igo.context.contextManager.dialog.saveTitle',
        undefined,
        {
          value: context.title || this.context()?.title
        }
      );
      const currentContext = this.contextService.context$.value;
      if (currentContext && currentContext.id === id) {
        currentContext.title = context.title;
        currentContext.uri = context.uri;
      }
      this.contextService.setEditedContext(undefined);
      this.submitSuccessed.emit(context);
    });
  }
}
