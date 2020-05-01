import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';

import { AuthService } from '@igo2/auth';
import { LanguageService, MessageService } from '@igo2/core';
import { IgoMap } from '@igo2/geo';

import { DetailedContext, ContextsList } from '../shared/context.interface';
import { ContextListControlsEnum } from './context-list.enum';
import { Subscription, BehaviorSubject, ReplaySubject, EMPTY, timer } from 'rxjs';
import { MatDialog } from '@angular/material';
import { ContextService } from '../shared/context.service';
import { BookmarkDialogComponent } from '../../context-map-button/bookmark-button/bookmark-dialog.component';
import { debounce } from 'rxjs/operators';

@Component({
  selector: 'igo-context-list',
  templateUrl: './context-list.component.html',
  styleUrls: ['./context-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContextListComponent implements OnInit, OnDestroy {
  private contextsInitial: ContextsList = { ours: [] };
  contexts$: BehaviorSubject<ContextsList> = new BehaviorSubject(this.contextsInitial);

  change$ = new ReplaySubject<void>(1);

  private change$$: Subscription;

  @Input()
  get contexts(): ContextsList {
    return this._contexts;
  }
  set contexts(value: ContextsList) {
    this._contexts = value;
    this.cdRef.detectChanges();
    this.next();
  }
  private _contexts: ContextsList = { ours: [] };

  @Input()
  get selectedContext(): DetailedContext {
    return this._selectedContext;
  }
  set selectedContext(value: DetailedContext) {
    this._selectedContext = value;
    this.cdRef.detectChanges();
  }
  private _selectedContext: DetailedContext;

  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  @Input()
  get defaultContextId(): string {
    return this._defaultContextId;
  }
  set defaultContextId(value: string) {
    this._defaultContextId = value;
  }
  private _defaultContextId: string;

  @Output() select = new EventEmitter<DetailedContext>();
  @Output() unselect = new EventEmitter<DetailedContext>();
  @Output() edit = new EventEmitter<DetailedContext>();
  @Output() delete = new EventEmitter<DetailedContext>();
  @Output() save = new EventEmitter<DetailedContext>();
  @Output() clone = new EventEmitter<DetailedContext>();
  @Output() favorite = new EventEmitter<DetailedContext>();
  @Output() managePermissions = new EventEmitter<DetailedContext>();
  @Output() manageTools = new EventEmitter<DetailedContext>();

  public titleMapping = {
    ours: 'igo.context.contextManager.ourContexts',
    shared: 'igo.context.contextManager.sharedContexts',
    public: 'igo.context.contextManager.publicContexts'
  };

  // public users = ['COG', '911', 'Public'];

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
  public _term: string = '';

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

  constructor(
    private cdRef: ChangeDetectorRef,
    public auth: AuthService,
    private dialog: MatDialog,
    private contextService: ContextService,
    private languageService: LanguageService,
    private messageService: MessageService) {}

  ngOnInit() {
    this.change$$ = this.change$
      .pipe(
        debounce(() => {
          return this.contexts.ours.length === 0 ? EMPTY : timer(50);
        })
      )
      .subscribe(() => {
        this.contexts$.next(this.filterContextsList(this.contexts));
      });
  }

  private next() {
    this.change$.next();
  }

  private filterContextsList(contexts: ContextsList) {
    if (this.term === '') {
      if (this.sortedAlpha) {
        contexts = this.sortContextsList(contexts);
      }
      return contexts;
    } else {
      const ours = contexts.ours.filter((context) => {
        const filterNormalized = this.term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const contextTitleNormalized = context.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return contextTitleNormalized.includes(filterNormalized);
      });

      let updateContexts: ContextsList = {
        ours
      };

      if (this.contexts.public) {
        const publics = contexts.public.filter((context) => {
          const filterNormalized = this.term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const contextTitleNormalized = context.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return contextTitleNormalized.includes(filterNormalized);
        });
        updateContexts.public = publics;
      }

      if (this.contexts.shared) {
        const shared = contexts.shared.filter((context) => {
          const filterNormalized = this.term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const contextTitleNormalized = context.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
      default:
        let totalLength = this.contexts.ours.length;
        this.contexts.public ? totalLength += this.contexts.public.length : totalLength += 0;
        this.contexts.shared ? totalLength += this.contexts.shared.length : totalLength += 0;
        if (totalLength >= this.thresholdToFilter) {
          return true;
        }
        return false;
    }
  }

  sortContextsList(contexts: ContextsList) {
    if (contexts) {
      const contextsList = JSON.parse(JSON.stringify(contexts));
      contextsList.ours.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        }
        if (a.title > b.title) {
          return 1;
        }
        return 0;
      });

      if (contextsList.shared) {
        contextsList.shared.sort((a, b) => {
          if (a.title < b.title) {
            return -1;
          }
          if (a.title > b.title) {
            return 1;
          }
          return 0;
        });
      } else if (contextsList.public) {
        contextsList.public.sort((a, b) => {
          if (a.title < b.title) {
            return -1;
          }
          if (a.title > b.title) {
            return 1;
          }
          return 0;
        });
      }
      return contextsList;
    }
  }

  toggleSort(sortAlpha: boolean) {
    this.sortedAlpha = sortAlpha;
  }

  clearFilter() {
    this.term = '';
  }

  createContext() {
    this.dialog
      .open(BookmarkDialogComponent, { disableClose: false })
      .afterClosed()
      .subscribe(title => {
        if (title) {
          const context = this.contextService.getContextFromMap(this.map);
          context.title = title;
          this.contextService.create(context).subscribe(() => {
            const translate = this.languageService.translate;
            const titleD = translate.instant(
              'igo.context.bookmarkButton.dialog.createTitle'
            );
            const message = translate.instant(
              'igo.context.bookmarkButton.dialog.createMsg',
              {
                value: context.title
              }
            );
            this.messageService.success(message, titleD);
            this.contextService.loadContext(context.uri);
          });
        }
      });
  }

  // userSelection() {
  //   return;
  // }
}
