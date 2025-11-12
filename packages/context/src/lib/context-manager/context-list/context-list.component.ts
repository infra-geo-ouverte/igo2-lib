import { Clipboard } from '@angular/cdk/clipboard';
import { AsyncPipe, KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject,
  input,
  model,
  output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '@igo2/auth';
import {
  ActionStore,
  ActionbarComponent,
  ActionbarMode
} from '@igo2/common/action';
import { CollapsibleComponent } from '@igo2/common/collapsible';
import { ConfirmDialogService } from '@igo2/common/confirm-dialog';
import { ListComponent, ListItemDirective } from '@igo2/common/list';
import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import { StorageService } from '@igo2/core/storage';
import { type IgoMap, MapService, isLayerItemOptions } from '@igo2/geo';

import { BehaviorSubject, ReplaySubject, Subscription, timer } from 'rxjs';
import { debounceTime, switchMap, take, tap } from 'rxjs/operators';
import { debounce } from 'rxjs/operators';

import { BookmarkDialogComponent } from '../../context-map-button/bookmark-button/bookmark-dialog.component';
import { ShareMapService } from '../../share-map/shared/share-map.service';
import { ContextItemComponent } from '../context-item/context-item.component';
import {
  Context,
  ContextDetailedChanges,
  ContextProfils,
  ContextServiceOptions,
  ContextUserPermission,
  ContextsList,
  DetailedContext
} from '../shared/context.interface';
import { ContextService } from '../shared/context.service';
import { ContextListControlsEnum } from './context-list.enum';

@Component({
  selector: 'igo-context-list',
  templateUrl: './context-list.component.html',
  styleUrls: ['./context-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ListComponent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ActionbarComponent,
    MatMenuModule,
    MatCheckboxModule,
    CollapsibleComponent,
    ContextItemComponent,
    ListItemDirective,
    AsyncPipe,
    KeyValuePipe,
    IgoLanguageModule
  ]
})
export class ContextListComponent implements OnInit, OnDestroy {
  configService = inject(ConfigService);
  auth = inject(AuthService);
  private contextService = inject(ContextService);
  private shareMapService = inject(ShareMapService);
  private clipboard = inject(Clipboard);
  private messageService = inject(MessageService);
  private mapService = inject(MapService);
  private confirmDialogService = inject(ConfirmDialogService);
  private dialog = inject(MatDialog);
  private languageService = inject(LanguageService);
  private storageService = inject(StorageService);

  public contextConfigs: ContextServiceOptions;
  private contextsInitial: ContextsList = { ours: [] };
  contexts$ = new BehaviorSubject<ContextsList>(this.contextsInitial);

  change$ = new ReplaySubject<void>(1);

  private change$$: Subscription;
  private previousMessageId: number;

  @Input() isDesktop: boolean;
  @Input()
  get contexts(): ContextsList {
    return this._contexts;
  }
  set contexts(value: ContextsList) {
    this._contexts = value;
    this.next();
  }
  private _contexts: ContextsList = { ours: [] };

  readonly selectedContext = model<DetailedContext>(undefined);

  readonly map = input<IgoMap>(undefined);

  @Input()
  get defaultContextId(): string {
    return this.contextConfigs
      ? this._defaultContextId
      : (this.storageService.get('favorite.context.uri') as string) ||
          this._defaultContextId;
  }
  set defaultContextId(value: string) {
    this._defaultContextId = value;
  }
  private _defaultContextId: string;

  public collapsed: { contextScope }[] = [];

  readonly select = output<DetailedContext>();
  readonly unselect = output<DetailedContext>();
  readonly edit = output<DetailedContext>();
  readonly delete = output<DetailedContext>();
  readonly save = output<DetailedContext>();
  readonly clone = output<DetailedContext>();
  readonly create = output<{
    title: string;
    empty: boolean;
  }>();
  readonly hide = output<DetailedContext>();
  readonly show = output<DetailedContext>();
  readonly showHiddenContexts = output<boolean>();
  readonly favorite = output<DetailedContext>();
  readonly managePermissions = output<DetailedContext>();
  readonly manageTools = output<DetailedContext>();
  readonly filterPermissionsChanged = output<ContextUserPermission[]>();

  public titleMapping = {
    ours: 'igo.context.contextManager.ourContexts',
    shared: 'igo.context.contextManager.sharedContexts',
    public: 'igo.context.contextManager.publicContexts'
  };

  public users: ContextProfils[];
  public permissions: ContextUserPermission[] = [];

  public actionStore = new ActionStore([]);
  public actionbarMode = ActionbarMode.Overlay;

  public color = 'primary';

  public showHidden = false;

  /**
   * Context filter term
   */
  @Input()
  set term(value: string) {
    this._term = value;
    this.next();
  }
  get term(): string {
    return this._term;
  }
  public _term = '';

  get sortedAlpha(): boolean {
    return this._sortedAlpha;
  }
  set sortedAlpha(value: boolean) {
    this._sortedAlpha = value;
    this.next();
  }
  private _sortedAlpha: boolean = undefined;

  public showContextFilter = ContextListControlsEnum.always;

  public thresholdToFilter = 5;

  get isEmpty(): boolean {
    return (
      !this.contexts.ours.length &&
      !this.contexts.public?.length &&
      !this.contexts.shared?.length
    );
  }

  private contexts$$: Subscription;
  private selectedContext$$: Subscription;
  private defaultContextId$$: Subscription;

  constructor() {
    this.contextConfigs = this.configService.getConfig('context');
  }

  ngOnInit() {
    this.change$$ = this.change$
      .pipe(debounce(() => timer(50)))
      .subscribe(() => {
        this.contexts$.next(this.filterContextsList(this.contexts));
      });

    this.actionStore.load([
      {
        id: 'emptyContext',
        title: this.languageService.translate.instant(
          'igo.context.contextManager.emptyContext'
        ),
        icon: 'star',
        tooltip: this.languageService.translate.instant(
          'igo.context.contextManager.emptyContextTooltip'
        ),
        handler: () => {
          this.createContext(true);
        }
      },
      {
        id: 'contextFromMap',
        title: this.languageService.translate.instant(
          'igo.context.contextManager.contextMap'
        ),
        icon: 'map',
        tooltip: this.languageService.translate.instant(
          'igo.context.contextManager.contextMapTooltip'
        ),
        handler: () => {
          this.createContext(false);
        }
      }
    ]);

    // Override input contexts
    this.contexts = { ours: [] };
    this.showHidden = this.storageService.get('contexts.showHidden') as boolean;

    this.contexts$$ = this.contextService.contexts$.subscribe(
      (contexts) => (this.contexts = contexts)
    );

    this.defaultContextId$$ = this.contextService.defaultContextId$.subscribe(
      (id) => {
        this.defaultContextId = id;
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
        this.setSelected(context);
      });

    this.auth.authenticate$.subscribe((authenticate) => {
      if (authenticate) {
        this.contextService.getProfilByUser().subscribe((profils) => {
          this.users = profils;
          this.permissions = [];
          const profilsAcc = this.users.reduce((acc, cur) => {
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
            this.permissions.push(permission);
          }

          const permissions = ['none'];
          for (const p of this.permissions) {
            if (p.checked === true || p.indeterminate === true) {
              permissions.push(p.name);
            }
          }

          this.contextService.loadContexts(permissions, this.showHidden);
        });
      }
    });
  }

  ngOnDestroy() {
    this.change$$.unsubscribe();
    this.contexts$$.unsubscribe();
    this.selectedContext$$.unsubscribe();
    this.defaultContextId$$.unsubscribe();
  }

  setSelected(context: DetailedContext) {
    this.selectedContext.set(context);
  }

  private next() {
    this.change$.next();
  }

  private filterContextsList(contexts: ContextsList): ContextsList {
    if (this.term === '') {
      if (this.sortedAlpha) {
        contexts = this.sortContextsList(contexts);
      }
      return contexts;
    } else {
      const ours = contexts.ours.filter((context) => {
        const filterNormalized = this.term
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const contextTitleNormalized = context.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        return contextTitleNormalized.includes(filterNormalized);
      });

      let updateContexts: ContextsList = {
        ours
      };

      if (this.contexts.public) {
        const publics = contexts.public.filter((context) => {
          const filterNormalized = this.term
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          const contextTitleNormalized = context.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          return contextTitleNormalized.includes(filterNormalized);
        });
        updateContexts.public = publics;
      }

      if (this.contexts.shared) {
        const shared = contexts.shared.filter((context) => {
          const filterNormalized = this.term
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          const contextTitleNormalized = context.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          return contextTitleNormalized.includes(filterNormalized);
        });
        updateContexts.shared = shared;
      }

      if (this.sortedAlpha) {
        updateContexts = this.sortContextsList(updateContexts);
      }
      return updateContexts;
    }
  }

  public showFilter() {
    switch (this.showContextFilter) {
      case ContextListControlsEnum.always:
        return true;
      case ContextListControlsEnum.never:
        return false;
      default: {
        let totalLength = this.contexts.ours.length;

        this.contexts.public
          ? (totalLength += this.contexts.public.length)
          : (totalLength += 0);

        this.contexts.shared
          ? (totalLength += this.contexts.shared.length)
          : (totalLength += 0);
        if (totalLength >= this.thresholdToFilter) {
          return true;
        }
        return false;
      }
    }
  }

  sortContextsList(contexts: ContextsList) {
    if (contexts) {
      const contextsList = JSON.parse(JSON.stringify(contexts));
      contextsList.ours.sort((a, b) => {
        if (this.normalize(a.title) < this.normalize(b.title)) {
          return -1;
        }
        if (this.normalize(a.title) > this.normalize(b.title)) {
          return 1;
        }
        return 0;
      });

      if (contextsList.shared) {
        contextsList.shared.sort((a, b) => {
          if (this.normalize(a.title) < this.normalize(b.title)) {
            return -1;
          }
          if (this.normalize(a.title) > this.normalize(b.title)) {
            return 1;
          }
          return 0;
        });
      } else if (contextsList.public) {
        contextsList.public.sort((a, b) => {
          if (this.normalize(a.title) < this.normalize(b.title)) {
            return -1;
          }
          if (this.normalize(a.title) > this.normalize(b.title)) {
            return 1;
          }
          return 0;
        });
      }
      return contextsList;
    }
  }

  normalize(str: string) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  toggleSort() {
    this.sortedAlpha = !this.sortedAlpha;
  }

  clearFilter() {
    this.term = '';
  }

  createContext(empty?: boolean) {
    this.dialog
      .open(BookmarkDialogComponent, { disableClose: false })
      .afterClosed()
      .pipe(take(1))
      .subscribe((title: string) => {
        if (title) {
          this.onCreate({ title, empty });
        }
      });
  }

  getPermission(user?): ContextUserPermission {
    if (user) {
      const permission = this.permissions.find((p) => p.name === user.name);
      return permission;
    }
  }

  handleToggleCategory(user, parent?) {
    const permission = this.getPermission(user);
    if (permission) {
      permission.checked = !permission.checked;
      this.storageService.set(
        'contexts.permissions.' + permission.name,
        permission.checked
      );
      permission.indeterminate = false;
    }

    if (parent) {
      let indeterminate = false;

      for (const c of parent.childs) {
        const cPermission = this.getPermission(c);
        if (cPermission.checked !== permission.checked) {
          indeterminate = true;
          break;
        }
      }
      const parentPermission = this.getPermission(parent);
      if (parentPermission) {
        parentPermission.checked = permission.checked;
        this.storageService.set(
          'contexts.permissions.' + parentPermission.name,
          permission.checked
        );
        parentPermission.indeterminate = indeterminate;
      }
    }

    if (user.childs) {
      for (const c of user.childs) {
        const childrenPermission = this.getPermission(c);
        if (
          childrenPermission &&
          childrenPermission.checked !== permission.checked
        ) {
          childrenPermission.checked = permission.checked;
          this.storageService.set(
            'contexts.permissions.' + childrenPermission.name,
            permission.checked
          );
        }
      }
    }

    this.onFilterPermissionsChanged();
  }

  showContext(context: DetailedContext) {
    context.hidden = false;
    this.contextService.showContext(context.id).subscribe();

    this.show.emit(context);
  }

  onSelect(context: DetailedContext) {
    this.contextService.loadContext(context.uri);
    this.select.emit(context);
  }

  isContextSelected(context: DetailedContext): boolean {
    const selectedContext = this.selectedContext();
    if (!selectedContext) return false;

    return context?.id
      ? selectedContext.id === context.id
      : selectedContext.uri === context.uri;
  }

  onShareContext(context: DetailedContext) {
    const currentContext = this.contextService.context$.value;
    const { toolKey, sidenavKey, languageKey } =
      this.shareMapService.routeService.options;
    const { context: contextKey } = this.shareMapService.options;
    const baseOrigin = this.shareMapService.encoder.sanitizeBaseUrl(
      this.shareMapService.document.location.href
    );

    const url =
      context.uri === currentContext.uri
        ? this.shareMapService.encoder.generateUrl(
            this.map(),
            this.contextService.context$.value
          )
        : `${baseOrigin}${contextKey}=${context.uri}`;

    const params: string[] = [];

    const currentLanguage = this.shareMapService.encoder.language;
    if (currentLanguage && !url.includes(`${languageKey}=`))
      params.push(`${languageKey}=${currentLanguage}`);

    if (!url.includes(`${toolKey}=`)) params.push(`${toolKey}=${'mapTools'}`);
    if (!url.includes(`${sidenavKey}=`)) params.push(`${sidenavKey}=1`);

    const fullUrl = params.length ? `${url}&${params.join('&')}` : url;
    const successful = this.clipboard.copy(fullUrl);
    if (!successful) return;

    this.messageService.success(
      'igo.context.shareMap.dialog.copyMsg',
      'igo.context.shareMap.dialog.copyTitle'
    );
  }

  onEdit(context: Context) {
    this.contextService.loadEditedContext(context.uri);
    this.edit.emit(context);
  }

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

    this.contextService
      .update(context.id, changes)
      .pipe(
        tap((changes) => {
          this.handleContextChanges(changes);
          msgSuccess();
        }),
        switchMap(() => this.contextService.getDetails(context.id)),
        tap((fullContext) => {
          this.contextService.context$.value.layers = fullContext.layers;
        }),
        take(1)
      )
      .subscribe();

    this.save.emit(context);
  }

  private handleContextChanges(changes: ContextDetailedChanges): void {
    const map = this.mapService.getMap();
    changes.layers.created.forEach((layerCreated) => {
      const layer = isLayerItemOptions(layerCreated)
        ? map.layerController.getBySourceId(layerCreated.sourceOptions.id)
        : map.layerController.getByTitle(layerCreated.title);
      if (layer) {
        layer.id = layerCreated.id;
      }
    });
  }

  onFavorite(context: Context) {
    if (!context.id) {
      context.id = context.uri;
    }
    this.contextService.setDefault(context.id).subscribe((defaultId) => {
      if (this.previousMessageId) {
        this.messageService.remove(this.previousMessageId);
      }

      this.contextService.defaultContextId$.next(defaultId);
      if (defaultId) {
        const messageObj = this.messageService.success(
          'igo.context.contextManager.dialog.favoriteMsg',
          'igo.context.contextManager.dialog.favoriteTitle',
          undefined,
          {
            value: context.title
          }
        );
        this.previousMessageId = messageObj.toastId;
      }

      this.favorite.emit(context);
    });
  }

  onManageTools(context: Context) {
    this.contextService.loadEditedContext(context.uri);
    this.manageTools.emit(context);
  }

  onManagePermissions(context: Context) {
    this.contextService.loadEditedContext(context.uri);
    this.managePermissions.emit(context);
  }

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

          this.delete.emit(context);
        }
      });
  }

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
    this.clone.emit(context);
  }

  onCreate(opts: { title: string; empty: boolean }) {
    const { title, empty } = opts;
    const context = this.contextService.getContextFromMap(this.map(), empty);
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

    this.create.emit(opts);
  }

  onFilterPermissionsChanged() {
    const permissions = ['none'];
    for (const p of this.permissions) {
      if (p.checked === true || p.indeterminate === true) {
        permissions.push(p.name);
      }
    }

    this.contextService.loadContexts(permissions, this.showHidden);

    this.filterPermissionsChanged.emit(this.permissions);
  }

  onShowHiddenContexts() {
    this.showHidden = !this.showHidden;
    this.storageService.set('contexts.showHidden', this.showHidden);
    this.onFilterPermissionsChanged();
    this.showHiddenContexts.emit(this.showHidden);
  }

  onHideContext(context: DetailedContext) {
    this.contextService.hideContext(context.id).subscribe();

    context.hidden = true;
    if (!this.showHidden) {
      const contexts: ContextsList = { ours: [], shared: [], public: [] };
      contexts.ours = this.contexts.ours.filter((c) => c.id !== context.id);
      contexts.shared = this.contexts.shared?.filter(
        (c) => c.id !== context.id
      );
      contexts.public = this.contexts.public?.filter(
        (c) => c.id !== context.id
      );
      this.contexts = contexts;
    }
    this.hide.emit(context);
  }
}
