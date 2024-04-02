import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
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
import { MatTooltipModule } from '@angular/material/tooltip';

import { EntityStore } from '@igo2/common';
import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';

import { TranslateModule } from '@ngx-translate/core';
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
    NgFor,
    MatOptionModule,
    MatTooltipModule,
    MatSelectModule,
    MatListModule,
    NgIf,
    MatDialogActions,
    MatButtonModule,
    AsyncPipe,
    TranslateModule
  ]
})
export class AddCatalogDialogComponent implements OnInit, OnDestroy {
  public form: UntypedFormGroup;
  private defaultAddedCatalogType = 'wms';
  private addedCatalogType$$: Subscription;
  public predefinedCatalogsList$ = new BehaviorSubject<Catalog[]>([]);
  typeCapabilities: string[];
  predefinedCatalogs: Catalog[] = [];
  store: EntityStore<Catalog>;
  error = false;
  addedCatalog: Catalog;
  emailAddress: string;
  private storeViewAll$$: Subscription;

  constructor(
    private formBuilder: UntypedFormBuilder,
    public languageService: LanguageService,
    private configService: ConfigService,
    public dialogRef: MatDialogRef<AddCatalogDialogComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: {
      predefinedCatalogs: Catalog[];
      store: EntityStore<Catalog>;
      error: boolean;
      addedCatalog: Catalog;
    }
  ) {
    this.store = data.store;
    this.predefinedCatalogs = data.predefinedCatalogs;
    this.error = data.error;
    this.addedCatalog = data.addedCatalog;
    this.form = this.formBuilder.group({
      id: ['', []],
      title: ['', []],
      url: ['', [Validators.required]],
      type: [this.defaultAddedCatalogType, [Validators.required]]
    });
  }

  ngOnInit() {
    this.store.state.clear();
    this.typeCapabilities = Object.keys(TypeCapabilities);

    this.addedCatalogType$$ = this.form
      .get('type')
      .valueChanges.subscribe((value) => {
        if (value === 'wmts') {
          this.form.get('title').setValidators(Validators.required);
        } else {
          this.form.get('title').setValidators([]);
        }
        this.form.get('title').updateValueAndValidity();
      });

    this.computePredefinedCatalogList();
    this.storeViewAll$$ = this.store.view
      .all$()
      .subscribe(() => this.computePredefinedCatalogList());

    this.emailAddress = this.configService.getConfig('emailAddress');
  }

  ngOnDestroy() {
    this.addedCatalogType$$.unsubscribe();
    this.storeViewAll$$.unsubscribe();
  }

  changeUrlOrTitle(catalog: Catalog) {
    this.form.patchValue(catalog);
    this.error = false;
    this.computePredefinedCatalogList();
  }

  computePredefinedCatalogList() {
    this.predefinedCatalogsList$.next(
      this.predefinedCatalogs.filter((c) => !this.store.get(c.id))
    );
  }

  addCatalog(addedCatalog: Catalog) {
    this.error = false;
    this.dialogRef.close(addedCatalog);
  }

  cancel() {
    this.error = false;
    this.dialogRef.close();
  }
}
