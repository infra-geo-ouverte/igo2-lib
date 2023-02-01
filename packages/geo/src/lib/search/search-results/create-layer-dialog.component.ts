import { LanguageService } from '@igo2/core';
import { Component, OnInit, OnDestroy, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Layer } from '../../layer';
import { SearchResult } from '../shared';


@Component({
  selector: 'igo-create-layer-dialog',
  templateUrl: './create-layer-dialog.component.html',
  styleUrls: ['./create-layer-dialog.component.scss']
})
export class CreateLayerDialogComponent implements OnInit, OnDestroy {
  
  layers$: BehaviorSubject<Layer[]> = new BehaviorSubject([]);

  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];

  constructor(
    private formBuilder: UntypedFormBuilder,
    public languageService: LanguageService,
    public dialogRef: MatDialogRef<CreateLayerDialogComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { features: SearchResult[]; }
  ) {}
   

  ngOnInit() {
    console.log('from create layer dialog', this.data);
  }

  ngOnDestroy() {
   
  }

  save() {
    console.log('btn save clicked');
  }

  cancel() {
    console.log('btn cancel clicked');
    this.dialogRef.close();
  }
}
