import { Directive, Self, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MessageService } from '../../core/message';
import { ContextPermission, DetailedContext, ContextService } from '../shared';
import { ContextPermissionsComponent } from './context-permissions.component';


@Directive({
  selector: '[igoContextPermissionsBinding]'
})
export class ContextPermissionsBindingDirective implements OnInit, OnDestroy {

  private component: ContextPermissionsComponent;
  private editedContext$$: Subscription;

  @HostListener('addPermission', ['$event']) onAddPermission(permission: ContextPermission) {
    const contextId = this.component.context.id;
    this.contextService
      .addPermissionAssociation(contextId, permission.profil, permission.typePermission)
      .subscribe((p) => {
        this.component.permissions[permission.typePermission].push(p);
        const title = permission.profil;
        const message = `The permission '${title}' was added.`;
        this.messageService.success(message, 'Tool added');
      });
  }

  @HostListener('removePermission', ['$event']) onRemovePermission(permission: ContextPermission) {
    const contextId = this.component.context.id;
    this.contextService.deletePermissionAssociation(contextId, permission.id).subscribe(() => {
      const index = this.component.permissions[permission.typePermission].findIndex((p) => {
        return p.id === permission.id;
      });
      this.component.permissions[permission.typePermission].splice(index, 1);

      const title = permission.profil;
      const message = `The permission '${title}' was removed.`;
      this.messageService.success(message, 'Tool removed');
    });
  }

  constructor(@Self() component: ContextPermissionsComponent,
              private contextService: ContextService,
              private messageService: MessageService) {
    this.component = component;
  }


  ngOnInit() {
    this.editedContext$$ = this.contextService.editedContext$
      .subscribe(context => this.handleEditedContextChange(context));
  }

  ngOnDestroy() {
    this.editedContext$$.unsubscribe();
  }

  private handleEditedContextChange(context: DetailedContext) {
    this.component.context = context;

    if (context) {
      this.contextService.getPermissions(context.id)
        .subscribe((permissionsArray) => {
          const permissions = {
            read: permissionsArray.filter((p) => {
              return p.typePermission.toString() === 'read';
            }),
            write: permissionsArray.filter((p) => {
              return p.typePermission.toString() === 'write';
            })
          };
          return this.component.permissions = permissions;
        });
    }
  }

}
