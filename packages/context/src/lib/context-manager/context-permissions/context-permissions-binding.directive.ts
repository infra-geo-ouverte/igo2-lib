import {
  ChangeDetectorRef,
  Directive,
  HostListener,
  OnDestroy,
  OnInit,
  Self
} from '@angular/core';

import { LanguageService, MessageService } from '@igo2/core';

import { Subscription } from 'rxjs';

import {
  Context,
  ContextPermission,
  DetailedContext
} from '../shared/context.interface';
import { ContextService } from '../shared/context.service';
import { ContextPermissionsComponent } from './context-permissions.component';

@Directive({
  selector: '[igoContextPermissionsBinding]',
  standalone: true
})
export class ContextPermissionsBindingDirective implements OnInit, OnDestroy {
  private component: ContextPermissionsComponent;
  private editedContext$$: Subscription;

  @HostListener('addPermission', ['$event'])
  onAddPermission(permission: ContextPermission) {
    if (!permission.profil) {
      this.messageService.error(
        'igo.context.contextManager.errors.addPermissionEmpty',
        'igo.context.contextManager.errors.addPermissionTitle'
      );
      return;
    }
    const contextId = this.component.context.id;
    this.contextService
      .addPermissionAssociation(
        contextId,
        permission.profil,
        permission.typePermission
      )
      .subscribe((profils) => {
        for (const p of profils) {
          this.component.permissions[permission.typePermission].push(p);
        }
        const profil = permission.profil;
        this.messageService.success(
          'igo.context.permission.dialog.addMsg',
          'igo.context.permission.dialog.addTitle',
          undefined,
          { value: profil }
        );
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
        ].findIndex((p) => {
          return p.id === permission.id;
        });
        this.component.permissions[permission.typePermission].splice(index, 1);

        const profil = permission.profil;
        this.messageService.success(
          'igo.context.permission.dialog.deleteMsg',
          'igo.context.permission.dialog.deleteTitle',
          undefined,
          { value: profil }
        );
        this.cd.detectChanges();
      });
  }

  @HostListener('scopeChanged', ['$event'])
  onScopeChanged(context: Context) {
    const scope = context.scope;
    this.contextService.update(context.id, { scope }).subscribe(() => {
      this.messageService.success(
        'igo.context.permission.dialog.scopeChangedMsg',
        'igo.context.permission.dialog.scopeChangedTitle',
        undefined,
        { value: 'igo.context.permission.scope.' + scope }
      );
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
      (context) => this.handleEditedContextChange(context)
    );
  }

  ngOnDestroy() {
    this.editedContext$$.unsubscribe();
    this.contextService.editedContext$.next(undefined);
  }

  private handleEditedContextChange(context: DetailedContext) {
    this.component.context = context;

    if (context) {
      this.contextService
        .getPermissions(context.id)
        .subscribe((permissionsArray) => {
          permissionsArray = permissionsArray || [];
          const permissions = {
            read: permissionsArray.filter((p) => {
              return p.typePermission.toString() === 'read';
            }),
            write: permissionsArray.filter((p) => {
              return p.typePermission.toString() === 'write';
            })
          };
          return (this.component.permissions = permissions);
        });
    }
  }
}
