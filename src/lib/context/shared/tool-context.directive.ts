import { Directive, Self, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Tool, ToolbarComponent, ToolService } from '../../tool';

import { ContextService } from './context.service';
import { DetailedContext } from './context.interface';


@Directive({
  selector: '[igoToolContext]'
})
export class ToolContextDirective implements OnInit, OnDestroy {

  private component: ToolbarComponent;
  private context$$: Subscription;

  constructor(@Self() component: ToolbarComponent,
              private contextService: ContextService,
              private toolService: ToolService) {
    this.component = component;
  }

  ngOnInit() {
    this.context$$ = this.contextService.context$
      .filter(context => context !== undefined)
      .subscribe(context => this.handleContextChange(context));
  }

  ngOnDestroy() {
    this.context$$.unsubscribe();
  }

  private handleContextChange(context: DetailedContext) {
    if (context.tools === undefined || context.toolbar === undefined) {
      return;
    }

    const tools: Tool[] = [];
    (context.tools || []).forEach((tool_: Tool) => {
      // TODO: Remove the " || {}" when more tool will be defined
      const tool = this.toolService.getTool(tool_.name) || {};
      if (tool !== undefined) {
        tools.push(Object.assign({
          toolbar: context.toolbar.indexOf(tool_.name) >= 0
        }, tool, tool_));
      }
    });

    this.component.tools = tools;
  }

}
