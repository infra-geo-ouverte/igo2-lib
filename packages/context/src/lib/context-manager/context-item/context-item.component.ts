import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { AuthService } from '@igo2/auth';
import { StorageService } from '@igo2/core';

import { TypePermission } from '../shared/context.enum';
import { DetailedContext } from '../shared/context.interface';
import { TranslateModule } from '@ngx-translate/core';
import { CollapseDirective } from '../../../../../common/src/lib/collapsible/collapse.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StopPropagationDirective } from '../../../../../common/src/lib/stop-propagation/stop-propagation.directive';
import { MatButtonModule } from '@angular/material/button';
import { NgClass, NgIf } from '@angular/common';
import { MatListModule } from '@angular/material/list';

@Component({
    selector: 'igo-context-item',
    templateUrl: './context-item.component.html',
    styleUrls: ['./context-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatListModule, NgClass, NgIf, MatButtonModule, StopPropagationDirective, MatTooltipModule, MatIconModule, CollapseDirective, TranslateModule]
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
