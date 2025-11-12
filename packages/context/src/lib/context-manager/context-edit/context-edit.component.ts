import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  output,
  signal
} from '@angular/core';

import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';

import { Subscription } from 'rxjs';

import { ContextFormComponent } from '../context-form/context-form.component';
import { ContextService } from '../shared';
import { Context, DetailedContext } from '../shared/context.interface';

@Component({
  selector: 'igo-context-edit',
  templateUrl: './context-edit.component.html',
  imports: [ContextFormComponent, IgoLanguageModule]
})
export class ContextEditComponent implements OnInit, OnDestroy {
  private contextService = inject(ContextService);
  private messageService = inject(MessageService);

  readonly context = signal<Context>(undefined);

  readonly submitSuccessed = output<Context>();

  private editedContext$$: Subscription;

  ngOnInit() {
    this.editedContext$$ = this.contextService.editedContext$.subscribe(
      (context) => this.handleEditedContextChange(context)
    );
  }

  ngOnDestroy() {
    this.editedContext$$.unsubscribe();
  }

  private handleEditedContextChange(context: DetailedContext) {
    this.context.set(context);
  }

  onEdit(context: Context) {
    const id = this.context().id;
    this.contextService.update(id, context).subscribe(() => {
      this.messageService.success(
        'igo.context.contextManager.dialog.saveMsg',
        'igo.context.contextManager.dialog.saveTitle',
        undefined,
        {
          value: context.title || this.context().title
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
