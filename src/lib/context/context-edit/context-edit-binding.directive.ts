import { Directive, Self, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MessageService } from '../../core/message';
import { Context, DetailedContext, ContextService } from '../shared';
import { ContextEditComponent } from './context-edit.component';


@Directive({
  selector: '[igoContextEditBinding]'
})
export class ContextEditBindingDirective implements OnInit, OnDestroy {

  private component: ContextEditComponent;
  private editedContext$$: Subscription;

  @HostListener('submitForm', ['$event']) onEdit(context: Context) {
    const id = this.component.context.id;
    this.contextService.update(id, context).subscribe(() => {
      const title = context.title || this.component.context.title;
      const message = `The context '${title}' was saved.`;
      this.messageService.success(message, 'Context saved');
    });
  }

  constructor(@Self() component: ContextEditComponent,
              private contextService: ContextService,
              private messageService: MessageService) {
    this.component = component;
  }

  ngOnInit() {
    this.editedContext$$ = this.contextService.editedContext$
      .subscribe(context => this.handleEditedContextChange(context));
  }

  ngOnDestroy() {
    this.editedContext$$.unsubscribe();
  }

  private handleEditedContextChange(context: DetailedContext) {
    this.component.context = context;
  }

}
