import { KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
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
import { ConfigService } from '@igo2/core';

import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { CollapsibleComponent } from '../../../../../common/src/lib/collapsible/collapsible.component';
import { ListComponent } from '../../../../../common/src/lib/list/list.component';
import { StopPropagationDirective } from '../../../../../common/src/lib/stop-propagation/stop-propagation.directive';
import { TypePermission } from '../shared/context.enum';
import {
  Context,
  ContextPermission,
  ContextPermissionsList,
  ContextProfils
} from '../shared/context.interface';

@Component({
  selector: 'igo-context-permissions',
  templateUrl: './context-permissions.component.html',
  styleUrls: ['./context-permissions.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    NgFor,
    MatOptionModule,
    MatButtonModule,
    ListComponent,
    CollapsibleComponent,
    MatListModule,
    MatIconModule,
    StopPropagationDirective,
    MatTooltipModule,
    KeyValuePipe,
    TranslateModule
  ]
})
export class ContextPermissionsComponent implements OnInit {
  public form: UntypedFormGroup;

  @Input()
  get context(): Context {
    return this._context;
  }
  set context(value: Context) {
    this._context = value;
    this.cd.detectChanges();
  }
  private _context: Context;

  @Input()
  get permissions(): ContextPermissionsList {
    return this._permissions;
  }
  set permissions(value: ContextPermissionsList) {
    this._permissions = value;
    this.cd.detectChanges();
  }
  private _permissions: ContextPermissionsList;

  get profils(): ContextProfils[] {
    return this._profils;
  }
  set profils(value: ContextProfils[]) {
    this._profils = value;
    this.cd.detectChanges();
  }
  private _profils: ContextProfils[] = [];

  get canWrite(): boolean {
    return this.context.permission === TypePermission[TypePermission.write];
  }

  private baseUrlProfils;

  public formControl = new UntypedFormControl();
  formValueChanges$$: Subscription;

  @Output() addPermission: EventEmitter<ContextPermission> = new EventEmitter();
  @Output() removePermission: EventEmitter<ContextPermission> =
    new EventEmitter();
  @Output() scopeChanged: EventEmitter<Context> = new EventEmitter();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private cd: ChangeDetectorRef,
    private http: HttpClient,
    public authService: AuthService,
    private config: ConfigService
  ) {}

  ngOnInit(): void {
    this.buildForm();

    this.baseUrlProfils =
      this.config.getConfig('context.url') + '/profils-users?';

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
  }

  displayFn(profil?: ContextProfils): string | undefined {
    return profil ? profil.title : undefined;
  }

  public handleFormSubmit(value) {
    this.addPermission.emit(value);
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
}
