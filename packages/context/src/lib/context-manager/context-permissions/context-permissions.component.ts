import { HttpClient } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  OnInit,
  computed,
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
import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';

import { Subscription, map, of, switchMap, tap } from 'rxjs';

import { ContextService } from '../shared';
import { Context } from '../shared/context.interface';
import { ContextPermissionItemComponent } from './context-permission-item/context-permission-item.component';
import {
  ContextUserOrProfils,
  IAnyContextPermission
} from './context-permission.interface';
import { ContextPermissionService } from './context-permission.service';

@Component({
  selector: 'igo-context-permissions',
  templateUrl: './context-permissions.component.html',
  styleUrls: ['./context-permissions.component.scss'],
  imports: [
    CollapsibleComponent,
    FormsModule,
    IgoLanguageModule,
    ListComponent,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatOptionModule,
    MatRadioModule,
    MatTooltipModule,
    ReactiveFormsModule,
    ContextPermissionItemComponent
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
  private destroyRef = inject(DestroyRef); // Modern way to handle cleanup
  public form!: UntypedFormGroup;

  readonly context = model<Context>();
  readonly permissions = model<IAnyContextPermission[]>();
  readonly permissionsRead = computed(() =>
    this.permissions()?.filter(
      (permission) => permission.typePermission === 'read'
    )
  );
  readonly permissionsWrite = computed(() =>
    this.permissions()?.filter(
      (permission) => permission.typePermission === 'write'
    )
  );

  profils = signal<ContextUserOrProfils[]>([]);

  canWrite = computed(() => this.context()?.permission === 'write');

  private baseUrlProfils!: string;

  public formControl = new UntypedFormControl();
  formValueChanges$$!: Subscription;

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

  displayFn(profil?: ContextUserOrProfils): string {
    return profil ? profil.title : '';
  }

  handleFormSubmit(value: IAnyContextPermission) {
    const contextId = this.context()?.id;
    this.contextPermissionService
      .add(contextId!, value)
      .subscribe((permission) => {
        this.permissions.update((permissions) => {
          permissions!.push(permission);
          return [...permissions!];
        });
        this.messageService.success(
          'igo.context.permission.dialog.addMsg',
          'igo.context.permission.dialog.addTitle',
          undefined,
          { value: permission.title }
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
    const contextId = this.context()?.id;
    this.contextPermissionService
      .delete(contextId!, permission.id)
      .subscribe(() => {
        this.permissions.update((permissions) => {
          const index = permissions!.findIndex((p) => {
            return p.id === permission.id;
          });
          permissions!.splice(index, 1);
          return [...permissions!];
        });

        this.messageService.success(
          'igo.context.permission.dialog.deleteMsg',
          'igo.context.permission.dialog.deleteTitle',
          undefined,
          { value: permission.title }
        );
      });
  }

  onScopeChanged(context: Context) {
    const scope = context.scope;
    this.contextService.update(context.id!, { scope }).subscribe(() => {
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
          return this.contextPermissionService.getAll(context.id!);
        }),

        // 3. Automatically unsubscribe when component is destroyed
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((permissions) => {
        this.permissions.set(permissions);
      });
  }

  private getProfils(value: string) {
    const term = value.trim();
    return this.http
      .get<ContextUserOrProfils[]>(this.baseUrlProfils + 'q=' + term)
      .pipe(
        map((profils) => {
          const searchTokens = normalizeStr(term).split(/\s+/).filter(Boolean);
          return profils.filter((p) => {
            const candidate = normalizeStr(`${p.title ?? ''} ${p.name ?? ''}`);
            return searchTokens.every((token) => candidate.includes(token));
          });
        })
      );
  }
}

const normalizeStr = (str: string): string =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
