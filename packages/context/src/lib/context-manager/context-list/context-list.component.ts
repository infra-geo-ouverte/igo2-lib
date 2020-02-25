import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';

import { AuthService } from '@igo2/auth';

import { DetailedContext, ContextsList } from '../shared/context.interface';
import { Subscription, BehaviorSubject } from 'rxjs';

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

  constructor(private cdRef: ChangeDetectorRef, public auth: AuthService) {}

  ngOnInit() {
    this.term$$ = this.term$.subscribe((value) => {
      if (value === '') {
        this.contexts$.next(this.contexts);
      }

      if (value.length) {
        let ours; let publics; let shared;
        ours = this.contexts.ours.filter((context) => {
          const filterNormalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const contextTitleNormalized = context.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return contextTitleNormalized.includes(filterNormalized);
        });
        const updateContexts: ContextsList = {
          ours
        };

        if (this.contexts.public) {
          publics = this.contexts.public.filter((context) => {
            const filterNormalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const contextTitleNormalized = context.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return contextTitleNormalized.includes(filterNormalized);
          });
          updateContexts.public = publics;
        }
        if (this.contexts.shared) {
          shared = this.contexts.shared.filter((context) => {
            const filterNormalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const contextTitleNormalized = context.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return contextTitleNormalized.includes(filterNormalized);
          });
          updateContexts.shared = shared;
        }

        this.contexts$.next(updateContexts);
      }
    });
  }
}
