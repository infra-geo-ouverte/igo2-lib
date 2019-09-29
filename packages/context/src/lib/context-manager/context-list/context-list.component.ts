import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';

import { AuthService } from '@igo2/auth';

import { DetailedContext, ContextsList } from '../shared/context.interface';

@Component({
  selector: 'igo-context-list',
  templateUrl: './context-list.component.html'
})
export class ContextListComponent {
  @Input()
  get contexts(): ContextsList {
    return this._contexts;
  }
  set contexts(value: ContextsList) {
    this._contexts = value;
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

  constructor(private cdRef: ChangeDetectorRef, public auth: AuthService) {}
}
