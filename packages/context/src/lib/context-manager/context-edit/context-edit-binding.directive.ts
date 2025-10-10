import {
  Directive,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  inject
} from '@angular/core';

import { MessageService } from '@igo2/core/message';

import { Subscription } from 'rxjs';

import { Context, DetailedContext } from '../shared/context.interface';
import { ContextService } from '../shared/context.service';
import { ContextEditComponent } from './context-edit.component';

@Directive({
  selector: '[igoContextEditBinding]',
  standalone: true
})
export class ContextEditBindingDirective implements OnInit, OnDestroy {
  private contextService = inject(ContextService);
  private messageService = inject(MessageService);

  private component: ContextEditComponent;
  private editedContext$$: Subscription;

  @Output() submitSuccessed = new EventEmitter<Context>();

  @HostListener('submitForm', ['$event'])
  onEdit(context: Context) {
    const id = this.component.context.id;
    this.contextService.update(id, context).subscribe(() => {
      this.messageService.success(
        'igo.context.contextManager.dialog.saveMsg',
        'igo.context.contextManager.dialog.saveTitle',
        undefined,
        {
          value: context.title || this.component.context.title
        }
      );
      this.contextService.setEditedContext(undefined);
      this.submitSuccessed.emit(context);
    });
  }

  constructor() {
    const component = inject(ContextEditComponent, { self: true });

    this.component = component;
  }

  ngOnInit() {
    this.editedContext$$ = this.contextService.editedContext$.subscribe(
      (context) => this.handleEditedContextChange(context)
    );
  }

  ngOnDestroy() {
    this.editedContext$$.unsubscribe();
  }

  private handleEditedContextChange(context: DetailedContext) {
    this.component.context = context;
  }
}
