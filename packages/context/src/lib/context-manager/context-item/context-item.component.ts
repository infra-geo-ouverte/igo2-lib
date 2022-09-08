import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { StorageService } from '@igo2/core';
import { AuthService } from '@igo2/auth';
import { TypePermission } from '../shared/context.enum';
import { DetailedContext } from '../shared/context.interface';

@Component({
  selector: 'igo-context-item',
  templateUrl: './context-item.component.html',
  styleUrls: ['./context-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContextItemComponent {
  public typePermission = TypePermission;
  public color = 'primary';
  public collapsed = true;

  @Input() showFavorite: boolean = true;
  @Input() context: DetailedContext;
  @Input() default: boolean;
  @Input() selected: boolean;

  @Output() edit = new EventEmitter<DetailedContext>();
  @Output() delete = new EventEmitter<DetailedContext>();
  @Output() save = new EventEmitter<DetailedContext>();
  @Output() clone = new EventEmitter<DetailedContext>();
  @Output() hide = new EventEmitter<DetailedContext>();
  @Output() show = new EventEmitter<DetailedContext>();
  @Output() favorite = new EventEmitter<DetailedContext>();
  @Output() managePermissions = new EventEmitter<DetailedContext>();
  @Output() manageTools = new EventEmitter<DetailedContext>();

  get hidden(): boolean {
    return this.context.hidden;
  }

  get canShare(): boolean {
    return this.storageService.get('canShare') === true;
  }

  constructor(
    public auth: AuthService,
    private storageService: StorageService
  ) {}

  favoriteClick(context: DetailedContext) {
    this.favorite.emit(context);
  }
}
