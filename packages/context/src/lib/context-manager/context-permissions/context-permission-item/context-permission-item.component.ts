import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { User } from '@igo2/auth';
import { IgoLanguageModule } from '@igo2/core/language';

import {
  IAnyContextPermission,
  IContextPermissionUser
} from '../context-permission.interface';

@Component({
  selector: 'igo-context-permission-item',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    IgoLanguageModule
  ],
  templateUrl: './context-permission-item.component.html',
  styleUrl: './context-permission-item.component.scss'
})
export class ContextPermissionItemComponent {
  permission = input.required<IAnyContextPermission>();
  canWrite = input.required<boolean>();
  user = input<User>();

  type = computed(() => {
    const permission = this.permission();
    return isContextPermissionUser(permission) ? 'Intranet' : 'Profil';
  });
  icon = computed(() => {
    const permission = this.permission();
    return permission.profilType === 'user' ? 'person_shield' : 'badge';
  });
  canDelete = computed(() => {
    const permission = this.permission();
    return (
      this.canWrite() ||
      (isContextPermissionUser(permission) &&
        permission.user.externalId === this.user()?.id)
    );
  });

  delete = output<IAnyContextPermission>();

  isContextPermissionUser = isContextPermissionUser;

  onDelete(): void {
    this.delete.emit(this.permission());
  }
}

function isContextPermissionUser(
  permission: IAnyContextPermission
): permission is IContextPermissionUser {
  return (permission as IContextPermissionUser).userId != null;
}
