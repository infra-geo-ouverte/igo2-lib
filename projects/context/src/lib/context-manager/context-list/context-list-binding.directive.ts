import {
  Directive,
  Self,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { MessageService, LanguageService } from '@igo2/core';
import { ConfirmDialogService } from '@igo2/common';
import { MapService } from '@igo2/geo';

import {
  Context,
  DetailedContext,
  ContextsList
} from '../shared/context.interface';
import { ContextService } from '../shared/context.service';
import { ContextListComponent } from './context-list.component';

@Directive({
  selector: '[igoContextListBinding]'
})
export class ContextListBindingDirective implements OnInit, OnDestroy {
  private component: ContextListComponent;
  private contexts$$: Subscription;
  private selectedContext$$: Subscription;
  private defaultContextId$$: Subscription;

  @HostListener('select', ['$event'])
  onSelect(context: Context) {
    this.contextService.loadContext(context.uri);
  }

  @HostListener('edit', ['$event'])
  onEdit(context: Context) {
    this.contextService.loadEditedContext(context.uri);
  }

  @HostListener('save', ['$event'])
  onSave(context: Context) {
    const map = this.mapService.getMap();
    const contextFromMap = this.contextService.getContextFromMap(map);

    const changes: any = {
      layers: contextFromMap.layers,
      map: {
        view: contextFromMap.map.view
      }
    };

    this.contextService.update(context.id, changes).subscribe(() => {
      const translate = this.languageService.translate;
      const message = translate.instant(
        'igo.context.contextManager.dialog.saveMsg',
        {
          value: context.title
        }
      );
      const title = translate.instant(
        'igo.context.contextManager.dialog.saveTitle'
      );
      this.messageService.success(message, title);
    });
  }

  @HostListener('favorite', ['$event'])
  onFavorite(context: Context) {
    this.contextService.setDefault(context.id).subscribe(() => {
      this.contextService.defaultContextId$.next(context.id);
      const translate = this.languageService.translate;
      const message = translate.instant(
        'igo.context.contextManager.dialog.favoriteMsg',
        {
          value: context.title
        }
      );
      const title = translate.instant(
        'igo.context.contextManager.dialog.favoriteTitle'
      );
      this.messageService.success(message, title);
    });
  }

  @HostListener('manageTools', ['$event'])
  onManageTools(context: Context) {
    this.contextService.loadEditedContext(context.uri);
  }

  @HostListener('managePermissions', ['$event'])
  onManagePermissions(context: Context) {
    this.contextService.loadEditedContext(context.uri);
  }

  @HostListener('delete', ['$event'])
  onDelete(context: Context) {
    const translate = this.languageService.translate;
    this.confirmDialogService
      .open(
        translate.instant('igo.context.contextManager.dialog.confirmDelete')
      )
      .subscribe(confirm => {
        if (confirm) {
          this.contextService.delete(context.id).subscribe(() => {
            const message = translate.instant(
              'igo.context.contextManager.dialog.deleteMsg',
              {
                value: context.title
              }
            );
            const title = translate.instant(
              'igo.context.contextManager.dialog.deleteTitle'
            );
            this.messageService.info(message, title);
          });
        }
      });
  }

  @HostListener('clone', ['$event'])
  onClone(context: DetailedContext) {
    const properties = {
      title: context.title + '-copy',
      uri: context.uri + '-copy'
    };
    this.contextService.clone(context.id, properties).subscribe(() => {
      const translate = this.languageService.translate;
      const message = translate.instant(
        'igo.context.contextManager.dialog.cloneMsg',
        {
          value: context.title
        }
      );
      const title = translate.instant(
        'igo.context.contextManager.dialog.cloneTitle'
      );
      this.messageService.success(message, title);
    });
  }

  constructor(
    @Self() component: ContextListComponent,
    private contextService: ContextService,
    private mapService: MapService,
    private languageService: LanguageService,
    private confirmDialogService: ConfirmDialogService,
    private messageService: MessageService
  ) {
    this.component = component;
  }

  ngOnInit() {
    // Override input contexts
    this.component.contexts = { ours: [] };

    this.contexts$$ = this.contextService.contexts$.subscribe(contexts =>
      this.handleContextsChange(contexts)
    );

    this.defaultContextId$$ = this.contextService.defaultContextId$.subscribe(
      id => {
        this.component.defaultContextId = id;
      }
    );

    // See feature-list.component for an explanation about the debounce time
    this.selectedContext$$ = this.contextService.context$
      .pipe(debounceTime(100))
      .subscribe(context => (this.component.selectedContext = context));

    this.contextService.loadContexts();
  }

  ngOnDestroy() {
    this.contexts$$.unsubscribe();
    this.selectedContext$$.unsubscribe();
    this.defaultContextId$$.unsubscribe();
  }

  private handleContextsChange(contexts: ContextsList) {
    this.component.contexts = contexts;
  }
}
