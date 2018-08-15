import {
  Directive,
  Self,
  HostListener,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';

import { ToolService } from '../shared/tool.service';
import { Tool } from '../shared/tool.interface';
import { ToolbarComponent } from './toolbar.component';

@Directive({
  selector: '[igoToolbarBinding]'
})
export class ToolbarBindingDirective implements OnInit, OnDestroy {
  private component: ToolbarComponent;
  private selectedTool$$: Subscription;

  @HostListener('select', ['$event'])
  onSelect(tool: Tool) {
    this.toolService.selectTool(tool);
  }

  constructor(
    @Self() component: ToolbarComponent,
    private toolService: ToolService
  ) {
    this.component = component;
  }

  ngOnInit() {
    this.selectedTool$$ = this.toolService.selectedTool$.subscribe(
      tool => (this.component.selectedTool = tool)
    );
  }

  ngOnDestroy() {
    this.selectedTool$$.unsubscribe();
  }
}
