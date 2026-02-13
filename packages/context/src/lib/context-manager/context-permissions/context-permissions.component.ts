import { KeyValuePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
  model,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '@igo2/auth';
import { CollapsibleComponent } from '@igo2/common/collapsible';
import { ListComponent } from '@igo2/common/list';
import { StopPropagationDirective } from '@igo2/common/stop-propagation';
import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';

import { Subscription, map, of, switchMap, tap } from 'rxjs';

import { ContextService } from '../shared';
import { TypePermission } from '../shared/context.enum';
import { Context } from '../shared/context.interface';
import {
  ContextPermissionsList,
  ContextUserOrProfils,
  IAnyContextPermission,
  IContextPermissionUser
} from './context-permission.interface';
import { ContextPermissionService } from './context-permission.service';

@Component({
  selector: 'igo-context-permissions',
  templateUrl: './context-permissions.component.html',
  styleUrls: ['./context-permissions.component.scss'],
  imports: [
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatButtonModule,
    ListComponent,
    CollapsibleComponent,
    MatListModule,
    MatIconModule,
    StopPropagationDirective,
    MatTooltipModule,
    KeyValuePipe,
    IgoLanguageModule
  ]
})
export class ContextPermissionsComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private http = inject(HttpClient);
  authService = inject(AuthService);
  private config = inject(ConfigService);
  private contextService = inject(ContextService);
  private contextPermissionService = inject(ContextPermissionService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef); // Modern way to handle cleanup
  public form: UntypedFormGroup;

  readonly context = model<Context>();
  readonly permissions = model<ContextPermissionsList>();

  profils = signal<ContextUserOrProfils[]>([]);

  get canWrite(): boolean {
    return this.context().permission === TypePermission[TypePermission.write];
  }

  private baseUrlProfils;

  public formControl = new UntypedFormControl();
  formValueChanges$$: Subscription;

  ngOnInit(): void {
    this.buildForm();

    this.baseUrlProfils =
      this.config.getConfig('context.url') + '/profils/users?';

    this.formValueChanges$$ = this.formControl.valueChanges.subscribe(
      (value) => {
        if (value.length) {
          this.getProfils(value).subscribe((profils) =>
            this.profils.set(profils)
          );
        } else {
          this.profils.set([]);
        }
      }
    );

    this.handleEditedContextChange();
  }

  isContextPermissionUser = isContextPermissionUser;

  displayFn(profil?: ContextUserOrProfils): string | undefined {
    return profil ? profil.title : undefined;
  }

  handleFormSubmit(value: IAnyContextPermission) {
    const contextId = this.context().id;
    this.contextPermissionService
      .add(contextId, value)
      .subscribe((permission) => {
        this.permissions.update((permissions) => {
          const list = permissions[
            permission.typePermission
          ] as IAnyContextPermission[];
          list.push(permission);

          return permissions;
        });
        this.messageService.success(
          'igo.context.permission.dialog.addMsg',
          'igo.context.permission.dialog.addTitle'
        );
      });
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      id: null,
      userExternalId: null,
      profilId: null,
      typePermission: ['read']
    });
  }

  onProfilSelected(value: ContextUserOrProfils) {
    this.form.setValue({
      id: value.id,
      userExternalId: value.type === 'user' ? value.id : null,
      profilId: value.type === 'profil' ? value.id : null,
      typePermission: this.form.value.typePermission
    });
  }

  onRemovePermission(permission: IAnyContextPermission) {
    const contextId = this.context().id;
    this.contextPermissionService
      .delete(contextId, permission.id)
      .subscribe(() => {
        const list = this.permissions()[
          permission.typePermission
        ] as IAnyContextPermission[];
        const index = list.findIndex((p) => {
          return p.id === permission.id;
        });
        this.permissions.update((permissions) => {
          permissions[permission.typePermission].splice(index, 1);
          return permissions;
        });

        this.messageService.success(
          'igo.context.permission.dialog.deleteMsg',
          'igo.context.permission.dialog.deleteTitle',
          undefined,
          { value: permission.title }
        );
        this.cd.detectChanges();
      });
  }

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

  private handleEditedContextChange() {
    this.contextService.editedContext$
      .pipe(
        // 1. Cleanly handle the context update
        tap((context) => this.context.set(context)),

        // 2. Switch to the permissions call, or return an empty array if context is null
        switchMap((context) => {
          if (!context) return of([]);
          return this.contextPermissionService.getAll(context.id);
        }),

        // 3. Automatically unsubscribe when component is destroyed
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((permissionsArray) => {
        // 4. Process the final result
        const data = permissionsArray || [];
        this.permissions.set({
          read: data.filter((p) => p.typePermission.toString() === 'read'),
          write: data.filter((p) => p.typePermission.toString() === 'write')
        });
      });
  }

  private getProfils(value: string) {
    return this.http
      .get<ContextUserOrProfils[]>(this.baseUrlProfils + 'q=' + value)
      .pipe(
        map((profils) => {
          const search = normalizeStr(value);
          return profils.filter((p) =>
            normalizeStr(p.name + p.title).includes(search)
          );
        })
      );
  }
}

const normalizeStr = (str: string): string =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

function isContextPermissionUser(
  permission: IAnyContextPermission
): permission is IContextPermissionUser {
  return (permission as IContextPermissionUser).userId != null;
}
