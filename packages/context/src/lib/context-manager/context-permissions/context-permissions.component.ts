import { KeyValuePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, model, output } from '@angular/core';
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

import { Subscription } from 'rxjs';

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

  readonly addPermission = output<ContextPermission>();
  readonly removePermission = output<ContextPermission>();
  readonly scopeChanged = output<Context>();

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
