import { Directive, Self, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ToolService } from '../../tool/shared/tool.service';
import { Tool } from '../../tool/shared/tool.interface';
import { ToolbarComponent } from '../../tool/toolbar/toolbar.component';

import { ContextService } from './context.service';
import { DetailedContext } from './context.interface';

@Directive({
  selector: '[igoToolContext]'
})
export class ToolContextDirective implements OnInit, OnDestroy {
  private component: ToolbarComponent;
  private context$$: Subscription;

  constructor(
    @Self() component: ToolbarComponent,
    private toolService: ToolService,
    private contextService: ContextService
  ) {
    this.component = component;
  }

  ngOnInit() {
    this.context$$ = this.contextService.context$
      .pipe(filter(context => context !== undefined))
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
      const tool = this.toolService.getTool(tool_.name);
      if (tool !== undefined && context.toolbar.indexOf(tool_.name) >= 0) {
        tools.push(tool);
      }
    });

    this.component.tools = tools;
  }
}
