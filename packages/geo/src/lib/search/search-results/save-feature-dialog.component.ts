import { LanguageService } from '@igo2/core';
import { Component, OnInit, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Layer } from '../../layer';
import { SearchResult } from '../shared';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FeatureStore, Feature } from '../../feature';

@Component({
  selector: 'igo-save-feature-dialog',
  templateUrl: './save-feature-dialog.component.html',
  styleUrls: ['./save-feature-dialog.component.scss']
})
export class SaveFeatureDialogComponent implements OnInit {

  public form: UntypedFormGroup;
  feature: SearchResult;
  layers: Layer[] = [];
  stores: FeatureStore<Feature>[];
  filteredLayers$: Observable<Layer[]>;

  constructor(
    private formBuilder: UntypedFormBuilder,
    public languageService: LanguageService,
    public dialogRef: MatDialogRef<SaveFeatureDialogComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { feature: SearchResult; layers: Layer[], stores: FeatureStore<Feature>[]}
  ) {
    this.form = this.formBuilder.group({
      layerName: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.feature = this.data.feature;
    this.layers = this.data.layers;
    this.stores = this.data.stores;
    this.filteredLayers$ = this.form.controls['layerName'].valueChanges.pipe(
      startWith(''),
      map(val => this.filter(val))
    );
  }

  private filter(val): Layer[] {
    if(typeof val !== 'string'){
      return;
    }
    return this.layers.map(l => l).filter(layer =>
      layer?.title?.toLowerCase().includes(val.toLowerCase()));
  }

  displayFn(layer: Layer): string {
    return layer && layer.title ? layer.title: '';
  }

  save() {
    console.log('this.form.value.layerName:', this.form.value.layerName);
     const data: {layer: string | Layer, feature: SearchResult} = {layer: this.form.value.layerName, feature: this.feature};
    this.dialogRef.close(data);
  }

  cancel() {
    this.dialogRef.close();
  }

  onLayerSelected(layer: Layer) {
    console.log('layer');
    const activeStore = this.stores.find(store => store.layer.id === layer.id);
    if(activeStore && activeStore.entities$.value.length > 0) {
      const alreadySavedFeature = activeStore.entities$.value[0];
      if(alreadySavedFeature.properties?.type !== this.feature.data.properties?.type) {
        this.form.controls['layerName'].setErrors({'featureTypeError': true});
      }
    }
  }
}
