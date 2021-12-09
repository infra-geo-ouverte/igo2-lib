import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnyLayer, IgoMap, TileLayer, VectorTileLayer } from '@igo2/geo';
import { BehaviorSubject, Subscription } from 'rxjs';


@Component({
  selector: 'igo-offlinable-layer-selector',
  templateUrl: './offlinable-layer-selector.component.html',
  styleUrls: ['./offlinable-layer-selector.component.scss']
})
export class OfflinableLayerSelectorComponent implements OnInit, OnDestroy {
  @Input() map: IgoMap;
  public form: FormGroup;

  public offlinableLayers$: BehaviorSubject<AnyLayer[]> = new BehaviorSubject([]);
  private offlinableLayers$$: Subscription;

  @Output() selectedOfflinableLayers = new EventEmitter<VectorTileLayer | TileLayer[]>();

  get layers() {
    return this.form.get('layers').value;
  }
  set layers(value) {
    this.form.patchValue({ layers: value });
    this.selectedOfflinableLayers.emit(value);
  }

  constructor(private formBuilder: FormBuilder,) {
    this.buildForm();
  }

  ngOnInit(): void {
    this.offlinableLayers$$ = this.map.layers$.subscribe((layers) => {
      this.offlinableLayers$.next(layers.filter((layer: VectorTileLayer | TileLayer ) => layer.offlinable) as AnyLayer[]);
    });
  }

  ngOnDestroy(): void {
    this.offlinableLayers$$.unsubscribe();
  }

  public getLayerTitleById(id): string {
    return this.map.getLayerById(id).title;
  }

  private buildForm() {
      this.form = this.formBuilder.group({
        layers: [[], [Validators.required]]
      });

  }
}
