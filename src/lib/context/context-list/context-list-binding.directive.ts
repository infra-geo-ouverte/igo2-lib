import { Directive, Self, OnInit, OnDestroy,
         HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MessageService, LanguageService } from '../../core';
import { ConfirmDialogService } from '../../shared';
import { MapService } from '../../map';
import { Context, DetailedContext, ContextsList, ContextService } from '../shared';
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

  @HostListener('edit', ['$event']) onEdit(context: Context) {
    this.contextService.loadEditedContext(context.uri);
  }

  @HostListener('save', ['$event']) onSave(context: Context) {
    const layers = this.mapService.getMap().layers$.getValue();
    const changes = {
      layers: []
    };
    for (const l of layers) {
        const layer: any = l;
        const opts = {
          id: layer.options.id ? String(layer.options.id) : undefined,
          title: layer.options.title,
          type: layer.options.type,
          source: {
            params: layer.dataSource.options.params,
            url: layer.dataSource.options.url
          }
        }
        changes.layers.push(opts);
    }

    this.contextService.update(context.id, changes).subscribe(() => {
      const message = `The context '${context.title}' was saved`;
      this.messageService.info(message, 'Context saved');
    });

  }

  @HostListener('manageTools', ['$event']) onManageTools(context: Context) {
    this.contextService.loadEditedContext(context.uri);
  }

  @HostListener('managePermissions', ['$event']) onManagePermissions(context: Context) {
    this.contextService.loadEditedContext(context.uri);
  }

  @HostListener('delete', ['$event']) onDelete(context: Context) {
    this.confirmDialogService
      .open(this.languageService.translate.instant('igo.confirmDialog.confirmDeleteContext'))
      .subscribe((confirm) => {
        if (confirm) {
          this.contextService.delete(context.id).subscribe(() => {
            const message = `The context '${context.title}' was deleted`;
            this.messageService.info(message, 'Context deleted');
          });
        }
      });
  }

  @HostListener('clone', ['$event']) onClone(context: DetailedContext) {
    const properties = {
      title: context.title + '-copy',
      uri: context.uri + '-copy'
    };
    this.contextService.clone(context.id, properties).subscribe(() => {
      const message = `The context '${context.title}' was cloned`;
      this.messageService.info(message, 'Context cloned');
    });
  }

  constructor(@Self() component: ContextListComponent,
              private contextService: ContextService,
              private mapService: MapService,
              private languageService: LanguageService,
              private confirmDialogService: ConfirmDialogService,
              private messageService: MessageService) {
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
