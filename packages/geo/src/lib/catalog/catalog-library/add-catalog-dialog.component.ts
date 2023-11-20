import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { EntityStore } from '@igo2/common';
import { ConfigService, LanguageService } from '@igo2/core';

import { BehaviorSubject, Subscription } from 'rxjs';

import { TypeCapabilities } from '../../datasource/shared/capabilities.interface';
import { Catalog } from '../shared/catalog.abstract';

@Component({
  selector: 'igo-add-catalog-dialog',
  templateUrl: './add-catalog-dialog.component.html',
  styleUrls: ['./add-catalog-dialog.component.scss']
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
