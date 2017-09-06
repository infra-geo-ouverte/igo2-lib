import { Directive, Self, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MessageService, LanguageService } from '../../core';
import { ToolService, Tool } from '../../tool/shared';
import { DetailedContext, ContextService } from '../shared';
import { ContextToolsComponent } from './context-tools.component';


@Directive({
  selector: '[igoContextToolsBinding]'
})
export class ContextToolsBindingDirective implements OnInit, OnDestroy {

  private component: ContextToolsComponent;
  private editedContext$$: Subscription;

  @HostListener('addTool', ['$event']) onAddTool(tool: Tool) {
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

  @HostListener('removeTool', ['$event']) onRemoveTool(tool: Tool) {
    const contextId = this.component.context.id;
    this.contextService.deleteToolAssociation(contextId, tool.id).subscribe(() => {
      const name = tool.title || tool.name;
      const translate = this.languageService.translate;
      const message = translate.instant('igo.tool.dialog.removeMsg', {
        value: name
      });
      const title = translate.instant('igo.tool.dialog.removeTitle');
      this.messageService.success(message, title);
    });
  }

  constructor(@Self() component: ContextToolsComponent,
              private contextService: ContextService,
              private toolService: ToolService,
              private languageService: LanguageService,
              private messageService: MessageService) {
    this.component = component;
  }

  ngOnInit() {
    this.toolService.get().subscribe((tools) => this.component.tools = tools);

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
