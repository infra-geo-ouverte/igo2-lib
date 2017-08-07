import { Directive, Self, OnInit, OnDestroy,
         HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Context, ContextsList, ContextService } from '../shared';
import { ContextListComponent } from './context-list.component';


@Directive({
  selector: '[igoContextListBinding]'
})
export class ContextListBindingDirective implements OnInit, OnDestroy {

  private component: ContextListComponent;
  private contexts$$: Subscription;
  private selectedContext$$: Subscription;

  @HostListener('select', ['$event']) onSelect(context: Context) {
    this.contextService.loadContext(context.uri);
  }

  constructor(@Self() component: ContextListComponent,
              private contextService: ContextService) {
    this.component = component;
  }

  ngOnInit() {
    // Override input contexts
    this.component.contexts = {ours: []};

    this.contexts$$ = this.contextService.contexts$
      .subscribe(contexts => this.handleContextsChange(contexts));

    // See feature-list.component for an explanation about the debounce time
    this.selectedContext$$ = this.contextService.context$
      .debounceTime(100)
      .subscribe(context => this.component.selectedContext = context);

    this.contextService.loadContexts();
  }

  ngOnDestroy() {
    this.contexts$$.unsubscribe();
    this.selectedContext$$.unsubscribe();
  }

  private handleContextsChange(contexts: ContextsList) {
    this.component.contexts = contexts;
  }

}
