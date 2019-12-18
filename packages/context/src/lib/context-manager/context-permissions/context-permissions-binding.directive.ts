import {
  Directive,
  Self,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs';

import { MessageService, LanguageService } from '@igo2/core';

import {
  Context,
  ContextPermission,
  DetailedContext
} from '../shared/context.interface';
import { ContextService } from '../shared/context.service';
import { ContextPermissionsComponent } from './context-permissions.component';

@Directive({
  selector: '[igoContextPermissionsBinding]'
})
export class ContextPermissionsBindingDirective implements OnInit, OnDestroy {
  private component: ContextPermissionsComponent;
  private editedContext$$: Subscription;

  @HostListener('addPermission', ['$event'])
  onAddPermission(permission: ContextPermission) {
    const contextId = this.component.context.id;
    this.contextService
      .addPermissionAssociation(
        contextId,
        permission.profil,
        permission.typePermission
      )
      .subscribe(profils => {
        for (const p of profils) {
          this.component.permissions[permission.typePermission].push(p);
        }
        const profil = permission.profil;
        const translate = this.languageService.translate;
        const message = translate.instant('igo.context.permission.dialog.addMsg', {
          value: profil
        });
        const title = translate.instant('igo.context.permission.dialog.addTitle');
        this.messageService.success(message, title);
        this.cd.detectChanges();
      });
  }

  @HostListener('removePermission', ['$event'])
  onRemovePermission(permission: ContextPermission) {
    const contextId = this.component.context.id;
    this.contextService
      .deletePermissionAssociation(contextId, permission.id)
      .subscribe(() => {
        const index = this.component.permissions[
          permission.typePermission
        ].findIndex(p => {
          return p.id === permission.id;
        });
        this.component.permissions[permission.typePermission].splice(index, 1);

        const profil = permission.profil;
        const translate = this.languageService.translate;
        const message = translate.instant('igo.context.permission.dialog.deleteMsg', {
          value: profil
        });
        const title = translate.instant('igo.context.permission.dialog.deleteTitle');
        this.messageService.success(message, title);
      });
  }

  @HostListener('scopeChanged', ['$event'])
  onScopeChanged(context: Context) {
    const scope = context.scope;
    this.contextService.update(context.id, { scope }).subscribe(() => {
      const translate = this.languageService.translate;
      const message = translate.instant(
        'igo.context.permission.dialog.scopeChangedMsg',
        {
          value: translate.instant('igo.context.permission.scope.' + scope)
        }
      );
      const title = translate.instant(
        'igo.context.permission.dialog.scopeChangedTitle'
      );
      this.messageService.success(message, title);
    });
  }

  constructor(
    @Self() component: ContextPermissionsComponent,
    private contextService: ContextService,
    private languageService: LanguageService,
    private messageService: MessageService,
    private cd: ChangeDetectorRef
  ) {
    this.component = component;
  }

  ngOnInit() {
    this.editedContext$$ = this.contextService.editedContext$.subscribe(
      context => this.handleEditedContextChange(context)
    );
  }

  ngOnDestroy() {
    this.editedContext$$.unsubscribe();
  }

  private handleEditedContextChange(context: DetailedContext) {
    this.component.context = context;

    if (context) {
      this.contextService
        .getPermissions(context.id)
        .subscribe(permissionsArray => {
          permissionsArray = permissionsArray || [];
          const permissions = {
            read: permissionsArray.filter(p => {
              return p.typePermission.toString() === 'read';
            }),
            write: permissionsArray.filter(p => {
              return p.typePermission.toString() === 'write';
            })
          };
          return (this.component.permissions = permissions);
        });
    }
  }
}
