import { Component, Input, Output, EventEmitter } from '@angular/core';

import { AuthService } from '../../auth';
import { TypePermission } from '../shared/context.enum';
import { DetailedContext } from '../shared/context.interface';

@Component({
  selector: 'igo-context-item',
  templateUrl: './context-item.component.html',
  styleUrls: ['./context-item.component.styl']
})
export class ContextItemComponent {
  public typePermission = TypePermission;
  public color: string = 'primary';
  public collapsed: boolean = true;

  @Input()
  get context(): DetailedContext { return this._context; }
  set context(value: DetailedContext) {
    this._context = value;
  }
  private _context: DetailedContext;

  @Output() edit = new EventEmitter<DetailedContext>();
  @Output() delete = new EventEmitter<DetailedContext>();
  @Output() save = new EventEmitter<DetailedContext>();
  @Output() clone = new EventEmitter<DetailedContext>();
  @Output() managePermissions = new EventEmitter<DetailedContext>();
  @Output() manageTools = new EventEmitter<DetailedContext>();

  constructor(public auth: AuthService) {}

}
