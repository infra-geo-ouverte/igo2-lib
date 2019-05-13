import { Component, Input, Output, EventEmitter } from '@angular/core';

import { AuthService } from '@igo2/auth';
import { TypePermission } from '../shared/context.enum';
import { DetailedContext } from '../shared/context.interface';

@Component({
  selector: 'igo-context-item',
  templateUrl: './context-item.component.html',
  styleUrls: ['./context-item.component.scss']
})
export class ContextItemComponent {
  public typePermission = TypePermission;
  public color = 'primary';
  public collapsed = true;

  @Input()
  get context(): DetailedContext {
    return this._context;
  }
  set context(value: DetailedContext) {
    this._context = value;
  }
  private _context: DetailedContext;

  @Input()
  get default(): boolean {
    return this._default;
  }
  set default(value: boolean) {
    this._default = value;
  }
  private _default = false;

  @Output() edit = new EventEmitter<DetailedContext>();
  @Output() delete = new EventEmitter<DetailedContext>();
  @Output() save = new EventEmitter<DetailedContext>();
  @Output() clone = new EventEmitter<DetailedContext>();
  @Output() favorite = new EventEmitter<DetailedContext>();
  @Output() managePermissions = new EventEmitter<DetailedContext>();
  @Output() manageTools = new EventEmitter<DetailedContext>();

  constructor(public auth: AuthService) {}

  favoriteClick(context) {
    if (this.auth.authenticated) {
      this.favorite.emit(context);
    }
  }
}
