import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnInit,
  ElementRef
} from '@angular/core';

import { AuthService } from '@igo2/auth';
import { LanguageService, MessageService } from '@igo2/core';
import { IgoMap } from '@igo2/geo';

import { DetailedContext, ContextsList } from '../shared/context.interface';
import { ContextListControlsEnum } from './context-list.enum';
import { Subscription, BehaviorSubject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ContextService } from '../shared';
import { BookmarkDialogComponent } from '../../context-map-button/bookmark-button/bookmark-dialog.component';


@Component({
  selector: 'igo-context-list',
  templateUrl: './context-list.component.html',
  styleUrls: ['./context-list.component.scss']
})
export class ContextListComponent implements OnInit {
  contexts$: BehaviorSubject<ContextsList> = new BehaviorSubject(undefined);

  @Input()
  get contexts(): ContextsList {
    return this._contexts;
  }
  set contexts(value: ContextsList) {
    this._contexts = value;
    this.contexts$.next(value);
    this.cdRef.detectChanges();
  }
  private _contexts: ContextsList = { ours: [] };
  contexts$$: Subscription;

  private contextsInitial: ContextsList = { ours: [] };

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

  /**
   * Context filter term
   */
  @Input()
  set term(value: string) {
    this.term$.next(value);
  }
  get term(): string {
    return this.term$.value;
  }
  public term$: BehaviorSubject<string> = new BehaviorSubject('');
  term$$: Subscription;

  get sortedAlpha(): boolean {
    return this._sortedAlpha;
  }
  set sortedAlpha(value: boolean) {
    this._sortedAlpha = value;
  }
  private _sortedAlpha: boolean = undefined;

  public contextsAlpha: ContextsList;

  public contextsTemp: ContextsList;

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
    this.contexts$$ = this.contexts$.subscribe(() => {
      if (this.sortedAlpha === undefined && this.term === '') {
        this.contextsInitial = this.contexts;
      }
    })

    this.term$$ = this.term$.subscribe((value) => {
      if (this.filterContextsList(value)) {
        this.contexts = this.filterContextsList(value);
      }
    });
  }

  private filterContextsList(term) {
    if (term === '') {
      return;
    }

    if (term.length) {
      let ours; let publics; let shared;
      ours = this.contexts.ours.filter((context) => {
        const filterNormalized = term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const contextTitleNormalized = context.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return contextTitleNormalized.includes(filterNormalized);
      });
      const updateContexts: ContextsList = {
        ours
      };

      if (this.contexts.public) {
        publics = this.contexts.public.filter((context) => {
          const filterNormalized = term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const contextTitleNormalized = context.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return contextTitleNormalized.includes(filterNormalized);
        })
        updateContexts.public = publics;
      }
      if (this.contexts.shared) {
        shared = this.contexts.shared.filter((context) => {
          const filterNormalized = term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const contextTitleNormalized = context.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return contextTitleNormalized.includes(filterNormalized);
        });
        updateContexts.shared = shared;
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
    if (this.sortedAlpha === true) {
      const filterList = this.filterContextsList(this.term) ? this.filterContextsList(this.term) : this.contextsInitial;
      this.contextsTemp = filterList;
      this.contextsAlpha = this.sortContextsList(filterList);
      this.contexts = this.contextsAlpha;
    } else if (this.sortedAlpha === false) {
      const filterList = this.filterContextsList(this.term) ? this.contextsTemp : this.contextsInitial;
      this.contexts = filterList;
    }
  }

  clearFilter() {
    this.term = '';
    this.contexts = this.contextsInitial;
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
}
