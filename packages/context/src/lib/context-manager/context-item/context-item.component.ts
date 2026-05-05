import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '@igo2/auth';
import { StopPropagationDirective } from '@igo2/common/stop-propagation';
import { IgoLanguageModule } from '@igo2/core/language';
import { StorageService } from '@igo2/core/storage';

import { TypePermission } from '../shared/context.enum';
import { DetailedContext } from '../shared/context.interface';

@Component({
  selector: 'igo-context-item',
  templateUrl: './context-item.component.html',
  styleUrls: ['./context-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatListModule,
    NgClass,
    MatButtonModule,
    StopPropagationDirective,
    MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    IgoLanguageModule
  ],
  host: {
    '[class.igo-list-item-focused]': 'this.isMenuOpen'
  }
})
export class ContextItemComponent {
  auth = inject(AuthService);
  private storageService = inject(StorageService);

  typePermission = TypePermission;
  color = 'primary';
  collapsed = true;

  readonly showFavorite = input(true);
  readonly context = input<DetailedContext>(undefined);
  readonly default = input<boolean>(undefined);
  readonly selected = input<boolean>(undefined);
  readonly isDesktop = input<boolean>(undefined);

  readonly edit = output<DetailedContext>();
  readonly delete = output<DetailedContext>();
  readonly save = output<DetailedContext>();
  readonly clone = output<DetailedContext>();
  readonly hide = output<DetailedContext>();
  readonly show = output<DetailedContext>();
  readonly favorite = output<DetailedContext>();
  readonly managePermissions = output<DetailedContext>();
  readonly manageTools = output<DetailedContext>();
  readonly share = output<DetailedContext>();

  get hidden(): boolean {
    return this.context().hidden;
  }

  get canShare(): boolean {
    return this.storageService.get('canShare') === true;
  }

  get isMenuOpen(): boolean {
    return this.itemActionsMenuTrigger()?.menuOpen ?? false;
  }

  itemActionsMenuTrigger = viewChild(MatMenuTrigger);

  favoriteClick(context: DetailedContext) {
    this.favorite.emit(context);
  }
}
