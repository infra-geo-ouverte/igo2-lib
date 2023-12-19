import {
  Directive,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  Self
} from '@angular/core';

import { MessageService } from '@igo2/core';

import { Subscription } from 'rxjs';

import { Context, DetailedContext } from '../shared/context.interface';
import { ContextService } from '../shared/context.service';
import { ContextEditComponent } from './context-edit.component';

@Directive({
  selector: '[igoContextEditBinding]'
})
export class ContextEditBindingDirective implements OnInit, OnDestroy {
  private component: ContextEditComponent;
  private editedContext$$: Subscription;

  @Output() submitSuccessed: EventEmitter<Context> = new EventEmitter();

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

  constructor(
    @Self() component: ContextEditComponent,
    private contextService: ContextService,
    private messageService: MessageService
  ) {
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
