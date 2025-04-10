import { AsyncPipe, KeyValuePipe, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
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
import { ListComponent, ListItemDirective } from '@igo2/common/list';
import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { IgoLanguageModule } from '@igo2/core/language';
import { StorageService } from '@igo2/core/storage';
import type { IgoMap } from '@igo2/geo';

import { BehaviorSubject, ReplaySubject, Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { debounce } from 'rxjs/operators';

import { BookmarkDialogComponent } from '../../context-map-button/bookmark-button/bookmark-dialog.component';
import { ContextItemComponent } from '../context-item/context-item.component';
import {
  ContextProfils,
  ContextServiceOptions,
  ContextUserPermission,
  ContextsList,
  DetailedContext
} from '../shared/context.interface';
import { ContextListControlsEnum } from './context-list.enum';

@Component({
  selector: 'igo-context-list',
  templateUrl: './context-list.component.html',
  styleUrls: ['./context-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ListComponent,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ActionbarComponent,
    MatMenuModule,
    NgFor,
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
  public contextConfigs: ContextServiceOptions;
  private contextsInitial: ContextsList = { ours: [] };
  contexts$ = new BehaviorSubject<ContextsList>(this.contextsInitial);

  change$ = new ReplaySubject<void>(1);

  private change$$: Subscription;

  @Input()
  get contexts(): ContextsList {
    return this._contexts;
  }
  set contexts(value: ContextsList) {
    this._contexts = value;
    this.next();
  }
  private _contexts: ContextsList = { ours: [] };

  @Input() selectedContext: DetailedContext;

  @Input() map: IgoMap;

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

  @Output() select = new EventEmitter<DetailedContext>();
  @Output() unselect = new EventEmitter<DetailedContext>();
  @Output() edit = new EventEmitter<DetailedContext>();
  @Output() delete = new EventEmitter<DetailedContext>();
  @Output() save = new EventEmitter<DetailedContext>();
  @Output() clone = new EventEmitter<DetailedContext>();
  @Output() create = new EventEmitter<{ title: string; empty: boolean }>();
  @Output() hide = new EventEmitter<DetailedContext>();
  @Output() show = new EventEmitter<DetailedContext>();
  @Output() showHiddenContexts = new EventEmitter<boolean>();
  @Output() favorite = new EventEmitter<DetailedContext>();
  @Output() managePermissions = new EventEmitter<DetailedContext>();
  @Output() manageTools = new EventEmitter<DetailedContext>();
  @Output() filterPermissionsChanged = new EventEmitter<
    ContextUserPermission[]
  >();

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

  constructor(
    private cdRef: ChangeDetectorRef,
    public configService: ConfigService,
    public auth: AuthService,
    private dialog: MatDialog,
    private languageService: LanguageService,
    private storageService: StorageService
  ) {
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

  ngOnDestroy() {
    this.change$$.unsubscribe();
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
          this.create.emit({ title, empty });
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

    this.filterPermissionsChanged.emit(this.permissions);
  }

  hideContext(context: DetailedContext) {
    context.hidden = true;
    if (!this.showHidden) {
      const contexts: ContextsList = { ours: [], shared: [], public: [] };
      contexts.ours = this.contexts.ours.filter((c) => c.id !== context.id);
      contexts.shared = this.contexts.shared.filter((c) => c.id !== context.id);
      contexts.public = this.contexts.public.filter((c) => c.id !== context.id);
      this.contexts = contexts;
    }
    this.hide.emit(context);
  }

  showContext(context: DetailedContext) {
    context.hidden = false;
    this.show.emit(context);
  }
}
