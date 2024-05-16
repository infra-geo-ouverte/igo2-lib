import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EntityStore } from '@igo2/common/entity';
import {
  Form,
  FormComponent,
  FormFieldComponent,
  FormService
} from '@igo2/common/form';
import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject, Subscription } from 'rxjs';

import { TypeCapabilities } from '../../datasource/shared/capabilities.interface';
import { Catalog } from '../shared/catalog.abstract';

@Component({
  selector: 'igo-add-catalog-dialog',
  templateUrl: './add-catalog-dialog.component.html',
  styleUrls: ['./add-catalog-dialog.component.scss'],
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTabsModule,
    NgFor,
    MatOptionModule,
    MatTooltipModule,
    MatSelectModule,
    MatListModule,
    NgIf,
    MatDialogActions,
    MatButtonModule,
    AsyncPipe,
    IgoLanguageModule,
    FormComponent,
    FormFieldComponent
  ]
})
export class AddCatalogDialogComponent implements OnInit, OnDestroy {
  predefinedForm$ = new BehaviorSubject<Form>(undefined);
  customForm$ = new BehaviorSubject<Form>(undefined);
  data$ = new BehaviorSubject<Catalog>(undefined);
  customData$ = new BehaviorSubject<Catalog>(undefined);
  emailAddress: string;
  private storeViewAll$$: Subscription;
  constructor(
    public languageService: LanguageService,
    private configService: ConfigService,
    private formService: FormService,
    public dialogRef: MatDialogRef<AddCatalogDialogComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: {
      predefinedCatalogs: Catalog[];
      store: EntityStore<Catalog>;
      error: boolean;
      addedCatalog: Catalog;
    }
  ) {}

  ngOnInit() {
    if (this.data.addedCatalog) {
      this.customData$.next(this.data.addedCatalog);
    }
    const types = Object.keys(TypeCapabilities).map((t) => {
      return { value: t, title: t };
    });
    this.storeViewAll$$ = this.data.store.view.all$().subscribe(() => {
      const predefinedChoices = this.data.predefinedCatalogs
        .filter((c) => !this.data.store.get(c.id))
        .map((predefinedCatalog) => {
          return {
            value: predefinedCatalog.id,
            title: predefinedCatalog.title
          };
        });

      const predefinedFieldConfigs = [
        {
          name: 'id',
          title: this.languageService.translate.instant(
            'igo.geo.catalog.library.predefined.select'
          ),
          type: 'select',
          options: {
            cols: 1,
            validator: Validators.required
          },
          inputs: {
            choices: predefinedChoices
          }
        }
      ];
      const predefinedFormFields = predefinedFieldConfigs.map((config) =>
        this.formService.field(config)
      );
      this.predefinedForm$.next(
        this.formService.form(predefinedFormFields, [])
      );
    });
    const customFieldConfigs = [
      {
        name: 'title',
        title: this.languageService.translate.instant(
          'igo.geo.catalog.library.custom.title'
        ),
        type: 'text',
        options: {
          validator: Validators.required
        }
      },
      {
        name: 'url',
        title: 'URL',
        type: 'text',
        options: {
          validator: Validators.required
        }
      },
      {
        name: 'type',
        title: 'Type',
        type: 'select',
        options: {
          cols: 1,
          validator: Validators.required
        },
        inputs: {
          choices: types
        }
      }
    ];
    const customFieldFormFields = customFieldConfigs.map((config) =>
      this.formService.field(config)
    );
    this.customForm$.next(this.formService.form(customFieldFormFields, []));
    this.emailAddress = this.configService.getConfig('emailAddress');
  }

  onPredefinedSubmit(data: Catalog) {
    const catalog = this.data.predefinedCatalogs.find((c) => c.id === data.id);
    if (this.checkFieldsValidity(this.predefinedForm$)) {
      this.dialogRef.close(catalog);
    }
  }
  onCustomSubmit(catalog: Catalog) {
    if (this.checkFieldsValidity(this.customForm$)) {
      this.dialogRef.close(catalog);
    }
  }
  ngOnDestroy() {
    this.storeViewAll$$?.unsubscribe();
  }

  checkFieldsValidity(form$: BehaviorSubject<Form>): boolean {
    const fields = form$.getValue().fields;
    return fields
      .map((field) => {
        if (field.control.invalid) {
          field.control.markAsTouched();
          field.control.updateValueAndValidity();
        }
        return field.control.valid;
      })
      .every((e) => e);
  }
}
