import { KeyValuePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  model
} from '@angular/core';
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

import { Subscription } from 'rxjs';

import { ContextService } from '../shared';
import { TypePermission } from '../shared/context.enum';
import {
  Context,
  ContextPermission,
  ContextPermissionsList,
  ContextProfils,
  DetailedContext
} from '../shared/context.interface';

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
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);

  public form: UntypedFormGroup;

  readonly context = model<Context>();
  readonly permissions = model<ContextPermissionsList>();

  get profils(): ContextProfils[] {
    return this._profils;
  }
  set profils(value: ContextProfils[]) {
    this._profils = value;
  }
  private _profils: ContextProfils[] = [];

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
          this.http
            .get(this.baseUrlProfils + 'q=' + value)
            .subscribe((profils) => {
              this.profils = profils as ContextProfils[];
            });
          this.profils.filter((profil) => {
            const filterNormalized = value
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');
            const profilTitleNormalized = profil.title
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');
            const profilNameNormalized = profil.name
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');
            const profilNormalized =
              profilNameNormalized + profilTitleNormalized;
            return profilNormalized.includes(filterNormalized);
          });
        } else {
          this.profils = [];
        }
      }
    );

    this.contextService.editedContext$.subscribe((context) =>
      this.handleEditedContextChange(context)
    );
  }

  displayFn(profil?: ContextProfils): string | undefined {
    return profil ? profil.title : undefined;
  }

  handleFormSubmit(permission) {
    if (!permission.profil) {
      this.messageService.error(
        'igo.context.contextManager.errors.addPermissionEmpty',
        'igo.context.contextManager.errors.addPermissionTitle'
      );
      return;
    }
    const contextId = this.context().id;
    this.contextService
      .addPermissionAssociation(
        contextId,
        permission.profil,
        permission.typePermission
      )
      .subscribe((profils) => {
        this.permissions.update((permissions) => {
          const list = permissions[
            permission.typePermission
          ] as ContextPermission[];
          list.push(...profils);

          return permissions;
        });
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

  private buildForm(): void {
    this.form = this.formBuilder.group({
      profil: [],
      typePermission: ['read']
    });
  }

  onProfilSelected(value) {
    this.form.setValue({
      profil: value.name,
      typePermission: this.form.value.typePermission
    });
  }

  onRemovePermission(permission: ContextPermission) {
    const contextId = this.context().id;
    this.contextService
      .deletePermissionAssociation(contextId, permission.id)
      .subscribe(() => {
        const list = this.permissions()[
          permission.typePermission
        ] as ContextPermission[];
        const index = list.findIndex((p) => {
          return p.id === permission.id;
        });
        this.permissions.update((permissions) => {
          permissions[permission.typePermission].splice(index, 1);
          return permissions;
        });

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

  private handleEditedContextChange(context: DetailedContext) {
    this.context.set(context);

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
          return this.permissions.set(permissions);
        });
    }
  }
}
