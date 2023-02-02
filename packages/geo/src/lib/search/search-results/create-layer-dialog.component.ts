import { LanguageService } from '@igo2/core';
import { Component, OnInit, OnDestroy, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Layer } from '../../layer';
import { SearchResult } from '../shared';

@Component({
  selector: 'igo-create-layer-dialog',
  templateUrl: './create-layer-dialog.component.html',
  styleUrls: ['./create-layer-dialog.component.scss']
})
export class CreateLayerDialogComponent implements OnInit, OnDestroy {
  
  public form: UntypedFormGroup;
  features: SearchResult[] = [];
  layers: Layer[] = [];

  constructor(
    private formBuilder: UntypedFormBuilder,
    public languageService: LanguageService,
    public dialogRef: MatDialogRef<CreateLayerDialogComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { features: SearchResult[]; layers: Layer[]}
  ) {
    this.form = this.formBuilder.group({
      layerName: ['', [Validators.required]],
    });
  }
   

  ngOnInit() {
    Object.assign(this.features, this.data.features);
    Object.assign(this.layers, this.data.layers);
    console.log('from save in layer dialog', this.layers[0].title);
  }

  ngOnDestroy() {
   
  }

  save() {
    console.log('btn save clicked');
    console.log(this.form.value.layerName)
    this.dialogRef.close({layer: this.form.value.layerName});

  }

  cancel() {
    console.log('btn cancel clicked');
    this.dialogRef.close();
  }
}
