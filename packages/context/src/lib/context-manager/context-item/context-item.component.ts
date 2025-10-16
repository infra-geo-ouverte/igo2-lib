import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '@igo2/auth';
import { CollapseDirective } from '@igo2/common/collapsible';
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
    CollapseDirective,
    IgoLanguageModule
  ]
})
export class ContextItemComponent {
  auth = inject(AuthService);
  private storageService = inject(StorageService);

  public typePermission = TypePermission;
  public color = 'primary';
  public collapsed = true;

  readonly showFavorite = input(true);
  readonly context = input<DetailedContext>(undefined);
  readonly default = input<boolean>(undefined);
  readonly selected = input<boolean>(undefined);

  readonly edit = output<DetailedContext>();
  readonly delete = output<DetailedContext>();
  readonly save = output<DetailedContext>();
  readonly clone = output<DetailedContext>();
  readonly hide = output<DetailedContext>();
  readonly show = output<DetailedContext>();
  readonly favorite = output<DetailedContext>();
  readonly managePermissions = output<DetailedContext>();
  readonly manageTools = output<DetailedContext>();

  get hidden(): boolean {
    return this.context().hidden;
  }

  get canShare(): boolean {
    return this.storageService.get('canShare') === true;
  }

  favoriteClick(context: DetailedContext) {
    this.favorite.emit(context);
  }
}
