import {
  ChangeDetectorRef,
  Directive,
  HostListener,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import { AuthService } from '@igo2/auth';
import { ConfirmDialogService } from '@igo2/common/confirm-dialog';
import { LanguageService } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import { StorageService } from '@igo2/core/storage';
import { MapService } from '@igo2/geo';

import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import {
  Context,
  ContextUserPermission,
  ContextsList,
  DetailedContext
} from '../shared/context.interface';
import { ContextService } from '../shared/context.service';
import { ContextListComponent } from './context-list.component';

@Directive({
  selector: '[igoContextListBinding]',
  standalone: true,
  providers: [ConfirmDialogService]
})
export class ContextListBindingDirective implements OnInit, OnDestroy {
  private contextService = inject(ContextService);
  private mapService = inject(MapService);
  private languageService = inject(LanguageService);
  private confirmDialogService = inject(ConfirmDialogService);
  private messageService = inject(MessageService);
  private auth = inject(AuthService);
  private storageService = inject(StorageService);
  private cdRef = inject(ChangeDetectorRef);

  private component: ContextListComponent;
  private contexts$$: Subscription;
  private selectedContext$$: Subscription;
  private defaultContextId$$: Subscription;
  private previousMessageId;

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

    const msgSuccess = () => {
      this.messageService.success(
        'igo.context.contextManager.dialog.saveMsg',
        'igo.context.contextManager.dialog.saveTitle',
        undefined,
        {
          value: context.title
        }
      );
    };

    if (context.imported) {
      contextFromMap.title = context.title;
      this.contextService.delete(context.id, true);
      this.contextService.create(contextFromMap).subscribe((contextCreated) => {
        this.contextService.loadContext(contextCreated.uri);
        msgSuccess();
      });
      return;
    }

    const changes: DetailedContext = {
      layers: contextFromMap.layers,
      map: {
        view: contextFromMap.map.view
      }
    };

    this.contextService.update(context.id, changes).subscribe(() => {
      msgSuccess();
    });
  }

  @HostListener('favorite', ['$event'])
  onFavorite(context: Context) {
    if (!context.id) {
      context.id = context.uri;
    }
    this.contextService.setDefault(context.id).subscribe(() => {
      if (this.previousMessageId) {
        this.messageService.remove(this.previousMessageId);
      }
      this.contextService.defaultContextId$.next(context.id);
      const messageObj = this.messageService.success(
        'igo.context.contextManager.dialog.favoriteMsg',
        'igo.context.contextManager.dialog.favoriteTitle',
        undefined,
        {
          value: context.title
        }
      );
      this.previousMessageId = messageObj.toastId;
      this.cdRef.detectChanges();
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
      .subscribe((confirm) => {
        if (confirm) {
          this.contextService
            .delete(context.id, context.imported)
            .subscribe(() => {
              this.messageService.info(
                'igo.context.contextManager.dialog.deleteMsg',
                'igo.context.contextManager.dialog.deleteTitle',
                undefined,
                { value: context.title }
              );
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
      this.messageService.success(
        'igo.context.contextManager.dialog.cloneMsg',
        'igo.context.contextManager.dialog.cloneTitle',
        undefined,
        { value: context.title }
      );
    });
  }

  @HostListener('create', ['$event'])
  onCreate(opts: { title: string; empty: boolean }) {
    const { title, empty } = opts;
    const context = this.contextService.getContextFromMap(
      this.component.map(),
      empty
    );
    context.title = title;
    this.contextService.create(context).subscribe(() => {
      this.messageService.success(
        'igo.context.bookmarkButton.dialog.createMsg',
        'igo.context.bookmarkButton.dialog.createTitle',
        undefined,
        { value: context.title }
      );
      this.contextService.loadContext(context.uri);
    });
  }

  @HostListener('filterPermissionsChanged')
  loadContexts() {
    const permissions = ['none'];
    for (const p of this.component.permissions) {
      if (p.checked === true || p.indeterminate === true) {
        permissions.push(p.name);
      }
    }

    this.contextService.loadContexts(permissions, this.component.showHidden);
  }

  @HostListener('showHiddenContexts')
  showHiddenContexts() {
    this.component.showHidden = !this.component.showHidden;
    this.storageService.set('contexts.showHidden', this.component.showHidden);
    this.loadContexts();
  }

  @HostListener('show', ['$event'])
  onShowContext(context: DetailedContext) {
    this.contextService.showContext(context.id).subscribe();
  }

  @HostListener('hide', ['$event'])
  onHideContext(context: DetailedContext) {
    this.contextService.hideContext(context.id).subscribe();
  }

  constructor() {
    const component = inject(ContextListComponent, { self: true });

    this.component = component;
  }

  ngOnInit() {
    // Override input contexts
    this.component.contexts = { ours: [] };
    this.component.showHidden = this.storageService.get(
      'contexts.showHidden'
    ) as boolean;

    this.contexts$$ = this.contextService.contexts$.subscribe((contexts) =>
      this.handleContextsChange(contexts)
    );

    this.defaultContextId$$ = this.contextService.defaultContextId$.subscribe(
      (id) => {
        this.component.defaultContextId = id;
      }
    );
    const storedContextUri = this.storageService.get(
      'favorite.context.uri'
    ) as string;
    if (storedContextUri && !this.auth.authenticated) {
      this.contextService.defaultContextId$.next(storedContextUri);
    }

    // See feature-list.component for an explanation about the debounce time
    this.selectedContext$$ = this.contextService.context$
      .pipe(debounceTime(100))
      .subscribe((context) => {
        this.component.setSelected(context);
        this.cdRef.markForCheck();
      });

    this.auth.authenticate$.subscribe((authenticate) => {
      if (authenticate) {
        this.contextService.getProfilByUser().subscribe((profils) => {
          this.component.users = profils;
          this.component.permissions = [];
          const profilsAcc = this.component.users.reduce((acc, cur) => {
            acc = acc.concat(cur);
            acc = cur.childs ? acc.concat(cur.childs) : acc;
            return acc;
          }, []);

          for (const user of profilsAcc) {
            const permission: ContextUserPermission = {
              name: user.name,
              checked: this.storageService.get(
                'contexts.permissions.' + user.name
              ) as boolean
            };
            if (permission.checked === null) {
              permission.checked = true;
            }
            this.component.permissions.push(permission);
          }

          const permissions = ['none'];
          for (const p of this.component.permissions) {
            if (p.checked === true || p.indeterminate === true) {
              permissions.push(p.name);
            }
          }

          this.contextService.loadContexts(
            permissions,
            this.component.showHidden
          );
        });
      }
    });
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
