import {
  Directive,
  Self,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';
import { Subscription } from 'rxjs';

import { MessageService, LanguageService } from '@igo2/core';

// import { Tool } from '../../tool/shared';
// import { ToolService } from '../../tool/shared';
import { DetailedContext } from '../shared/context.interface';
import { ContextService } from '../shared/context.service';
import { ContextToolsComponent } from './context-tools.component';

export interface Tool2 {
  id?: string;
  name: string;
  title?: string;
  icon?: string;
  iconImage?: string;
  inToolbar?: boolean;
  tooltip?: string;
  options?: { [key: string]: any };
}

@Directive({
  selector: '[igoContextToolsBinding]'
})
export class ContextToolsBindingDirective implements OnInit, OnDestroy {
  private component: ContextToolsComponent;
  private editedContext$$: Subscription;

  @HostListener('addTool', ['$event'])
  onAddTool(tool: Tool2) {
    const contextId = this.component.context.id;
    this.contextService.addToolAssociation(contextId, tool.id).subscribe(() => {
      const name = tool.title || tool.name;
      const translate = this.languageService.translate;
      const message = translate.instant('igo.tool.dialog.addMsg', {
        value: name
      });
      const title = translate.instant('igo.tool.dialog.addTitle');
      this.messageService.success(message, title);
    });
  }

  @HostListener('removeTool', ['$event'])
  onRemoveTool(tool: Tool2) {
    const contextId = this.component.context.id;
    this.contextService
      .deleteToolAssociation(contextId, tool.id)
      .subscribe(() => {
        const name = tool.title || tool.name;
        const translate = this.languageService.translate;
        const message = translate.instant('igo.tool.dialog.removeMsg', {
          value: name
        });
        const title = translate.instant('igo.tool.dialog.removeTitle');
        this.messageService.success(message, title);
      });
  }

  constructor(
    @Self() component: ContextToolsComponent,
    private contextService: ContextService,
    // private toolService: ToolService,
    private languageService: LanguageService,
    private messageService: MessageService
  ) {
    this.component = component;
  }

  ngOnInit() {
    // this.toolService.get().subscribe(tools => (this.component.tools = tools));
    //
    // this.editedContext$$ = this.contextService.editedContext$.subscribe(
    //   context => this.handleEditedContextChange(context)
    // );
  }

  ngOnDestroy() {
    this.editedContext$$.unsubscribe();
  }

  private handleEditedContextChange(context: DetailedContext) {
    this.component.context = context;
  }
}
