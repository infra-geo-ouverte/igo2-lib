import { AsyncPipe, NgFor } from '@angular/common';
import { Component, Inject, OnInit, Optional } from '@angular/core';
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

import { ListComponent, ListItemDirective } from '@igo2/common';
import { LanguageService } from '@igo2/core/language';

import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { Layer } from '../../layer/shared';
import { SearchResult } from '../shared';
import { SearchResultsItemComponent } from './search-results-item.component';

@Component({
  selector: 'igo-save-feature-dialog',
  templateUrl: './save-feature-dialog.component.html',
  styleUrls: ['./save-feature-dialog.component.scss'],
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    ListComponent,
    SearchResultsItemComponent,
    ListItemDirective,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    NgFor,
    MatOptionModule,
    MatListModule,
    MatDialogActions,
    MatButtonModule,
    AsyncPipe,
    TranslateModule
  ]
})
export class SaveFeatureDialogComponent implements OnInit {
  public form: UntypedFormGroup;
  feature: SearchResult;
  layers: Layer[] = [];
  filteredLayers$: Observable<Layer[]>;

  constructor(
    private formBuilder: UntypedFormBuilder,
    public languageService: LanguageService,
    public dialogRef: MatDialogRef<SaveFeatureDialogComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { feature: SearchResult; layers: Layer[] }
  ) {
    this.form = this.formBuilder.group({
      layerName: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.feature = this.data.feature;
    this.layers = this.data.layers;
    this.filteredLayers$ = this.form.controls['layerName'].valueChanges.pipe(
      startWith(''),
      map((val) => this.filter(val))
    );
  }

  private filter(val): Layer[] {
    if (typeof val !== 'string') {
      return;
    }
    return this.layers
      .map((l) => l)
      .filter((layer) =>
        layer?.title?.toLowerCase().includes(val.toLowerCase())
      );
  }

  displayFn(layer: Layer): string {
    return layer && layer.title ? layer.title : '';
  }

  save() {
    const data: { layer: string | Layer; feature: SearchResult } = {
      layer: this.form.value.layerName,
      feature: this.feature
    };
    this.dialogRef.close(data);
  }

  cancel() {
    this.dialogRef.close();
  }
}
